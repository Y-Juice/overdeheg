import { Pool } from "pg";
import { FlagService } from "../services/FlagService";
import { NLPService } from "../services/NLPService";
import { SystemLogService } from "../services/SystemLogService";

interface ScoreRow {
  uid: string;
  risk_score: number;
  total_weight: string;
  last_active: Date | null;
}

interface RecentMessageRow {
  uid: string;
  content: string;
}

/**
 * Bepaalt periodiek de risicoscore van elke bewoner.
 * Correlaties duwen de score omhoog; inactiviteit en vriendelijke
 * berichten laten die weer zakken.
 */
export class ThreatModelService {
  constructor(
    private readonly db: Pool,
    private readonly flagService: FlagService,
    private readonly nlp: NLPService,
    private readonly systemLog: SystemLogService
  ) {}

  /** Deler waarmee de som van correlatiegewichten naar 0..1 wordt geschaald. */
  private static readonly WEIGHT_DIVISOR = 3;

  /** Maximale korting door vriendelijke berichten. */
  private static readonly MAX_CIVIC_CREDIT = 0.4;

  /** Herberekent de risicoscore van alle bewoners en werkt hun vlaggen bij. */
  async recalculateScores(): Promise<void> {
    const result = await this.db.query<ScoreRow>(
      `SELECT r.uid, r.risk_score,
              COALESCE(SUM(c.weight), 0) AS total_weight,
              GREATEST(
                MAX(m.created_at),
                MAX(p.created_at),
                r.created_at
              ) AS last_active
       FROM residents r
       LEFT JOIN correlations c ON c.uid = r.uid
       LEFT JOIN messages m ON m.uid = r.uid
       LEFT JOIN location_pings p ON p.uid = r.uid
       GROUP BY r.uid, r.risk_score, r.created_at`
    );

    const civicByUid = await this.loadCivicCredit();

    for (const row of result.rows) {
      const rawScore = Math.min(
        1,
        Number(row.total_weight) / ThreatModelService.WEIGHT_DIVISOR
      );
      const decay = this.decayForInactivity(row.last_active);
      const civicCredit = civicByUid.get(row.uid) ?? 0;
      const score = this.clamp(rawScore * decay - civicCredit);
      const previous = row.risk_score;

      await this.db.query(
        "UPDATE residents SET risk_score = $1 WHERE uid = $2",
        [score, row.uid]
      );
      await this.flagService.evaluate(row.uid, score);

      if (previous - score >= 0.08) {
        const reasons: string[] = [];
        if (decay < 1) {
          reasons.push("inactiviteit");
        }
        if (civicCredit > 0) {
          reasons.push("vriendelijke berichten");
        }
        await this.systemLog.log(
          "info",
          `Risico van bewoner ${row.uid.slice(0, 8)} daalt naar ${score.toFixed(2)} (${reasons.join(" en ") || "verlopen signalen"})`
        );
      }
    }
  }

  /** Start de periodieke herberekening, met direct een eerste run bij het opstarten. */
  start(intervalMs: number): void {
    const safeRun = (): void => {
      this.recalculateScores().catch((error) => {
        console.error("Herberekening dreigingsmodel mislukt", error);
      });
    };
    safeRun();
    setInterval(safeRun, intervalMs);
  }

  /** Telt recente vriendelijke berichten per bewoner. */
  private async loadCivicCredit(): Promise<Map<string, number>> {
    const result = await this.db.query<RecentMessageRow>(
      `SELECT uid, content FROM messages
       WHERE is_deleted = FALSE
         AND created_at > now() - interval '3 hours'`
    );

    const credits = new Map<string, number>();
    for (const row of result.rows) {
      const civicScore = this.nlp.analyse(row.content).civicScore;
      if (civicScore <= 0) {
        continue;
      }
      const current = credits.get(row.uid) ?? 0;
      credits.set(
        row.uid,
        Math.min(ThreatModelService.MAX_CIVIC_CREDIT, current + civicScore)
      );
    }
    return credits;
  }

  /**
   * Hoe langer iemand stil is, hoe lager de vermenigvuldiger.
   * Na een kwartier begint de score te zakken.
   */
  private decayForInactivity(lastActive: Date | null): number {
    if (!lastActive) {
      return 0.2;
    }
    const hours = (Date.now() - new Date(lastActive).getTime()) / 3_600_000;
    if (hours < 0.25) {
      return 1;
    }
    if (hours < 0.5) {
      return 0.88;
    }
    if (hours < 1) {
      return 0.72;
    }
    if (hours < 3) {
      return 0.5;
    }
    if (hours < 8) {
      return 0.32;
    }
    return 0.12;
  }

  private clamp(value: number): number {
    return Math.max(0, Math.min(1, value));
  }
}
