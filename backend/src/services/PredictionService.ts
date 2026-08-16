import { Pool } from "pg";
import { PredictionsView } from "../types/api";
import { FlagLevel } from "../types/domain";
import { SystemLogService } from "./SystemLogService";

interface ZoneSignalRow {
  zone_id: number;
  zone_name: string;
  resident_count: string;
  average_risk: string | null;
  flagged_count: string;
  recent_messages: string;
  older_messages: string;
  recent_deletes: string;
  recent_pings: string;
  keyword_hits: string;
}

interface WatchRow {
  uid: string;
  zone_id: number;
  zone_name: string;
  risk_score: number;
  level: FlagLevel;
  signal_count: string;
  has_keyword: boolean;
  has_deletion: boolean;
  has_night: boolean;
  has_burst: boolean;
}

/**
 * Berekent voorspellende politie-inzichten uit bestaande data:
 * zoneprognoses, patrouilleadvies, watchlist en verwachte incidenten.
 */
export class PredictionService {
  constructor(
    private readonly db: Pool,
    private readonly systemLog: SystemLogService
  ) {}

  /** Bouwt het volledige voorspellingsoverzicht. */
  async getPredictions(): Promise<PredictionsView> {
    const [zoneRows, watchRows] = await Promise.all([
      this.loadZoneSignals(),
      this.loadWatchCandidates()
    ]);

    const zones = zoneRows.map((row) => this.toZoneForecast(row));
    zones.sort((left, right) => right.predictedRisk - left.predictedRisk);

    const patrols = zones
      .filter((zone) => zone.predictedRisk >= 0.28)
      .slice(0, 4)
      .map((zone) => ({
        zoneId: zone.zoneId,
        zoneName: zone.zoneName,
        predictedRisk: zone.predictedRisk,
        action:
          zone.predictedRisk >= 0.6
            ? "Directe patrouille"
            : zone.predictedRisk >= 0.4
              ? "Verhoogde aanwezigheid"
              : "Stille observatie"
      }));

    const watchlist = watchRows
      .map((row) => this.toWatchItem(row))
      .sort((left, right) => right.escalateChance - left.escalateChance)
      .slice(0, 8);

    const incidents = this.buildIncidents(zones, watchlist);

    return {
      hotZoneCount: patrols.length,
      watchCount: watchlist.length,
      zones,
      patrols,
      watchlist,
      incidents
    };
  }

  /**
   * Schrijft een korte samenvatting naar het systeemlog
   * wanneer er zones met patrouilleadvies zijn.
   */
  async logPatrolAdvice(): Promise<void> {
    const predictions = await this.getPredictions();
    if (predictions.patrols.length === 0) {
      return;
    }
    const top = predictions.patrols[0];
    await this.systemLog.log(
      top.predictedRisk >= 0.6 ? "alarm" : "waarschuwing",
      `Predictieve politie: ${top.action.toLowerCase()} in ${top.zoneName} (${Math.round(top.predictedRisk * 100)}%)`
    );
  }

  /** Start periodieke logging van patrouilleadvies. */
  start(intervalMs: number): void {
    const tick = (): void => {
      this.logPatrolAdvice().catch((error) => {
        console.error("Predictieve politie-log mislukt", error);
      });
    };
    setTimeout(tick, 8_000);
    setInterval(tick, intervalMs);
  }

  private async loadZoneSignals(): Promise<ZoneSignalRow[]> {
    const result = await this.db.query<ZoneSignalRow>(
      `SELECT
         z.id AS zone_id,
         z.name AS zone_name,
         COUNT(r.uid)::text AS resident_count,
         COALESCE(AVG(r.risk_score), 0)::text AS average_risk,
         COUNT(*) FILTER (
           WHERE COALESCE(f.level, 'laag') IN ('verhoogd', 'kritiek')
         )::text AS flagged_count,
         (
           SELECT COUNT(*)::text FROM messages m
           WHERE m.zone_id = z.id
             AND m.created_at >= NOW() - INTERVAL '30 minutes'
         ) AS recent_messages,
         (
           SELECT COUNT(*)::text FROM messages m
           WHERE m.zone_id = z.id
             AND m.created_at >= NOW() - INTERVAL '60 minutes'
             AND m.created_at < NOW() - INTERVAL '30 minutes'
         ) AS older_messages,
         (
           SELECT COUNT(*)::text FROM messages m
           WHERE m.zone_id = z.id
             AND m.is_deleted = TRUE
             AND m.created_at >= NOW() - INTERVAL '2 hours'
         ) AS recent_deletes,
         (
           SELECT COUNT(*)::text FROM location_pings p
           WHERE p.zone_id = z.id
             AND p.created_at >= NOW() - INTERVAL '2 hours'
         ) AS recent_pings,
         (
           SELECT COUNT(*)::text FROM correlations c
           JOIN residents rr ON rr.uid = c.uid
           WHERE rr.zone_id = z.id
             AND c.match_type IN ('keyword', 'night_activity', 'burst')
         ) AS keyword_hits
       FROM zones z
       LEFT JOIN residents r ON r.zone_id = z.id
       LEFT JOIN LATERAL (
         SELECT level FROM flags
         WHERE uid = r.uid
         ORDER BY id DESC
         LIMIT 1
       ) f ON TRUE
       GROUP BY z.id, z.name`
    );
    return result.rows;
  }

  private async loadWatchCandidates(): Promise<WatchRow[]> {
    const result = await this.db.query<WatchRow>(
      `SELECT r.uid, r.zone_id, z.name AS zone_name, r.risk_score,
              COALESCE(f.level, 'laag') AS level,
              COUNT(c.id)::text AS signal_count,
              COALESCE(BOOL_OR(c.match_type = 'keyword'), FALSE) AS has_keyword,
              COALESCE(BOOL_OR(c.match_type = 'deletion'), FALSE) AS has_deletion,
              COALESCE(BOOL_OR(c.match_type = 'night_activity'), FALSE) AS has_night,
              COALESCE(BOOL_OR(c.match_type = 'burst'), FALSE) AS has_burst
       FROM residents r
       JOIN zones z ON z.id = r.zone_id
       LEFT JOIN correlations c ON c.uid = r.uid
       LEFT JOIN LATERAL (
         SELECT level FROM flags
         WHERE uid = r.uid
         ORDER BY id DESC
         LIMIT 1
       ) f ON TRUE
       WHERE r.risk_score >= 0.22
          OR EXISTS (
            SELECT 1 FROM correlations cx
            WHERE cx.uid = r.uid
              AND cx.match_type IN ('keyword', 'deletion', 'night_activity', 'burst')
          )
       GROUP BY r.uid, r.zone_id, z.name, r.risk_score, f.level`
    );
    return result.rows;
  }

  private toZoneForecast(row: ZoneSignalRow): PredictionsView["zones"][number] {
    const averageRisk = Number(row.average_risk ?? 0);
    const residents = Math.max(1, Number(row.resident_count));
    const flagged = Number(row.flagged_count);
    const recentMessages = Number(row.recent_messages);
    const olderMessages = Number(row.older_messages);
    const deletes = Number(row.recent_deletes);
    const pings = Number(row.recent_pings);
    const keywordHits = Number(row.keyword_hits);

    const predictedRisk = this.clamp(
      averageRisk * 0.42 +
        Math.min(1, recentMessages / 8) * 0.2 +
        Math.min(1, deletes / 3) * 0.14 +
        (flagged / residents) * 0.14 +
        Math.min(1, keywordHits / 4) * 0.1
    );

    let trend: "stijgend" | "stabiel" | "dalend" = "stabiel";
    if (recentMessages > olderMessages + 1) {
      trend = "stijgend";
    } else if (recentMessages + 1 < olderMessages) {
      trend = "dalend";
    }

    const reasons: string[] = [];
    if (averageRisk >= 0.35) {
      reasons.push("hoge huidige score");
    }
    if (recentMessages >= 3) {
      reasons.push(`${recentMessages} recente berichten`);
    }
    if (deletes >= 1) {
      reasons.push("verwijderde berichten");
    }
    if (keywordHits >= 1) {
      reasons.push("beladen taal");
    }
    if (pings >= 4) {
      reasons.push("veel beweging");
    }
    if (reasons.length === 0) {
      reasons.push("weinig recente signalen");
    }

    return {
      zoneId: row.zone_id,
      zoneName: row.zone_name,
      currentRisk: averageRisk,
      predictedRisk,
      trend,
      reason: reasons.slice(0, 2).join(" · ")
    };
  }

  private toWatchItem(row: WatchRow): PredictionsView["watchlist"][number] {
    const extra =
      (row.has_keyword ? 0.12 : 0) +
      (row.has_deletion ? 0.1 : 0) +
      (row.has_night ? 0.08 : 0) +
      (row.has_burst ? 0.1 : 0) +
      Number(row.signal_count) * 0.03;

    const escalateChance = this.clamp(row.risk_score * 0.7 + extra);
    const reasons: string[] = [];
    if (row.has_keyword) {
      reasons.push("beladen woorden");
    }
    if (row.has_deletion) {
      reasons.push("verwijdert berichten");
    }
    if (row.has_night) {
      reasons.push("nachtactiviteit");
    }
    if (row.has_burst) {
      reasons.push("berichtburst");
    }
    if (row.risk_score >= 0.4) {
      reasons.push("score nabij kritiek");
    }
    if (reasons.length === 0) {
      reasons.push("oplopend patroon");
    }

    return {
      uid: row.uid,
      zoneName: row.zone_name,
      riskScore: row.risk_score,
      flagLevel: row.level,
      escalateChance,
      reason: reasons.slice(0, 2).join(" · ")
    };
  }

  private buildIncidents(
    zones: PredictionsView["zones"],
    watchlist: PredictionsView["watchlist"]
  ): PredictionsView["incidents"] {
    const incidents: PredictionsView["incidents"] = [];
    const rising = zones.filter((zone) => zone.trend === "stijgend").slice(0, 2);
    for (const zone of rising) {
      incidents.push({
        title: `Oplopende chatspanning in ${zone.zoneName}`,
        zoneName: zone.zoneName,
        likelihood: zone.predictedRisk,
        detail: zone.reason
      });
    }

    const hot = zones.find((zone) => zone.predictedRisk >= 0.45);
    if (hot) {
      incidents.push({
        title: `Verwachte clustering van signalen in ${hot.zoneName}`,
        zoneName: hot.zoneName,
        likelihood: hot.predictedRisk,
        detail: "Meerdere correlaties wijzen op een patrouillevenster"
      });
    }

    const nightWatch = watchlist.find((item) => item.reason.includes("nacht"));
    if (nightWatch) {
      incidents.push({
        title: "Nachtelijk patroon bij een bewoner",
        zoneName: nightWatch.zoneName,
        likelihood: nightWatch.escalateChance,
        detail: nightWatch.reason
      });
    }

    const deleteWatch = watchlist.find((item) =>
      item.reason.includes("verwijdert")
    );
    if (deleteWatch) {
      incidents.push({
        title: "Mogelijk wissen van sporen",
        zoneName: deleteWatch.zoneName,
        likelihood: deleteWatch.escalateChance,
        detail: deleteWatch.reason
      });
    }

    if (incidents.length === 0) {
      incidents.push({
        title: "Geen acuut incidentvenster",
        zoneName: "wijk",
        likelihood: 0.12,
        detail: "Wachten op nieuwe correlaties en beweging"
      });
    }

    return incidents.slice(0, 4);
  }

  private clamp(value: number): number {
    return Math.max(0, Math.min(1, value));
  }
}
