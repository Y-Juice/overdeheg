import { Pool } from "pg";
import { RiskOverviewView } from "../types/api";
import { CorrelationMatchType, FlagLevel } from "../types/domain";

interface ZoneRiskRow {
  zone_id: number;
  zone_name: string;
  resident_count: string;
  average_risk: string | null;
  max_risk: string | null;
  flagged_count: string;
}

interface ResidentRiskRow {
  uid: string;
  zone_id: number;
  zone_name: string;
  risk_score: number;
  level: FlagLevel;
}

interface SignalRow {
  match_type: CorrelationMatchType;
  count: string;
  total_weight: string | null;
}

interface FlagCountRow {
  level: FlagLevel;
  count: string;
}

interface CountRow {
  count: string;
}

interface AvgRow {
  average: string | null;
}

/**
 * Bouwt een overzicht van risicodata voor visualisatie:
 * scores per bewoner, risico per zone, correlatiesignalen en vlaggen.
 */
export class RiskOverviewService {
  constructor(private readonly db: Pool) {}

  /** Haalt alle aggregaties op die het risicopaneel nodig heeft. */
  async getOverview(): Promise<RiskOverviewView> {
    const [totals, zones, residents, signals, flags] = await Promise.all([
      this.loadTotals(),
      this.loadZoneRisks(),
      this.loadTopResidents(),
      this.loadSignals(),
      this.loadFlagCounts()
    ]);

    return { totals, zones, residents, signals, flags };
  }

  private async loadTotals(): Promise<RiskOverviewView["totals"]> {
    const [residents, average, flagged, critical, messages, pings, correlations] =
      await Promise.all([
        this.count("SELECT COUNT(*)::text AS count FROM residents"),
        this.db.query<AvgRow>("SELECT AVG(risk_score)::text AS average FROM residents"),
        this.count(
          `SELECT COUNT(*)::text AS count FROM residents r
           WHERE EXISTS (
             SELECT 1 FROM flags f
             WHERE f.uid = r.uid
               AND f.level IN ('verhoogd', 'kritiek')
               AND f.id = (SELECT MAX(id) FROM flags WHERE uid = r.uid)
           )`
        ),
        this.count(
          `SELECT COUNT(*)::text AS count FROM residents r
           WHERE EXISTS (
             SELECT 1 FROM flags f
             WHERE f.uid = r.uid
               AND f.level = 'kritiek'
               AND f.id = (SELECT MAX(id) FROM flags WHERE uid = r.uid)
           )`
        ),
        this.count("SELECT COUNT(*)::text AS count FROM messages"),
        this.count("SELECT COUNT(*)::text AS count FROM location_pings"),
        this.count("SELECT COUNT(*)::text AS count FROM correlations")
      ]);

    return {
      residentCount: residents,
      averageRisk: Number(average.rows[0]?.average ?? 0),
      flaggedCount: flagged,
      criticalCount: critical,
      messageCount: messages,
      pingCount: pings,
      correlationCount: correlations
    };
  }

  private async loadZoneRisks(): Promise<RiskOverviewView["zones"]> {
    const result = await this.db.query<ZoneRiskRow>(
      `SELECT
         z.id AS zone_id,
         z.name AS zone_name,
         COUNT(r.uid)::text AS resident_count,
         COALESCE(AVG(r.risk_score), 0)::text AS average_risk,
         COALESCE(MAX(r.risk_score), 0)::text AS max_risk,
         COUNT(*) FILTER (
           WHERE COALESCE(f.level, 'laag') IN ('verhoogd', 'kritiek')
         )::text AS flagged_count
       FROM zones z
       LEFT JOIN residents r ON r.zone_id = z.id
       LEFT JOIN LATERAL (
         SELECT level FROM flags
         WHERE uid = r.uid
         ORDER BY id DESC
         LIMIT 1
       ) f ON TRUE
       GROUP BY z.id, z.name
       ORDER BY AVG(r.risk_score) DESC NULLS LAST, z.name ASC`
    );

    return result.rows.map((row) => ({
      zoneId: row.zone_id,
      zoneName: row.zone_name,
      residentCount: Number(row.resident_count),
      averageRisk: Number(row.average_risk ?? 0),
      maxRisk: Number(row.max_risk ?? 0),
      flaggedCount: Number(row.flagged_count)
    }));
  }

  private async loadTopResidents(): Promise<RiskOverviewView["residents"]> {
    const result = await this.db.query<ResidentRiskRow>(
      `SELECT r.uid, r.zone_id, z.name AS zone_name, r.risk_score,
              COALESCE(f.level, 'laag') AS level
       FROM residents r
       JOIN zones z ON z.id = r.zone_id
       LEFT JOIN LATERAL (
         SELECT level FROM flags
         WHERE uid = r.uid
         ORDER BY id DESC
         LIMIT 1
       ) f ON TRUE
       ORDER BY r.risk_score DESC
       LIMIT 12`
    );

    return result.rows.map((row) => ({
      uid: row.uid,
      zoneId: row.zone_id,
      zoneName: row.zone_name,
      riskScore: row.risk_score,
      flagLevel: row.level
    }));
  }

  private async loadSignals(): Promise<RiskOverviewView["signals"]> {
    const result = await this.db.query<SignalRow>(
      `SELECT match_type, COUNT(*)::text AS count,
              COALESCE(SUM(weight), 0)::text AS total_weight
       FROM correlations
       GROUP BY match_type
       ORDER BY SUM(weight) DESC, COUNT(*) DESC`
    );

    return result.rows.map((row) => ({
      matchType: row.match_type,
      count: Number(row.count),
      totalWeight: Number(row.total_weight ?? 0)
    }));
  }

  private async loadFlagCounts(): Promise<RiskOverviewView["flags"]> {
    const result = await this.db.query<FlagCountRow>(
      `SELECT COALESCE(f.level, 'laag') AS level, COUNT(*)::text AS count
       FROM residents r
       LEFT JOIN LATERAL (
         SELECT level FROM flags
         WHERE uid = r.uid
         ORDER BY id DESC
         LIMIT 1
       ) f ON TRUE
       GROUP BY COALESCE(f.level, 'laag')
       ORDER BY CASE COALESCE(f.level, 'laag')
         WHEN 'kritiek' THEN 1
         WHEN 'verhoogd' THEN 2
         ELSE 3
       END`
    );

    return result.rows.map((row) => ({
      level: row.level,
      count: Number(row.count)
    }));
  }

  private async count(sql: string): Promise<number> {
    const result = await this.db.query<CountRow>(sql);
    return Number(result.rows[0]?.count ?? 0);
  }
}
