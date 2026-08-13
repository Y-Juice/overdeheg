import { Pool } from "pg";
import { FlagService } from "../services/FlagService";

/**
 * Bepaalt periodiek de risicoscore van elke bewoner op basis van
 * de gevonden correlaties en laat de FlagService het dreigingsniveau bijwerken.
 * Een score van 1 betekent dat meerdere zware gedragspatronen samenvallen.
 */
export class ThreatModelService {
  constructor(
    private readonly db: Pool,
    private readonly flagService: FlagService
  ) {}

  /** Deler waarmee de som van correlatiegewichten naar 0..1 wordt geschaald. */
  private static readonly WEIGHT_DIVISOR = 3;

  /** Herberekent de risicoscore van alle bewoners en werkt hun vlaggen bij. */
  async recalculateScores(): Promise<void> {
    const result = await this.db.query<{ uid: string; total_weight: string }>(
      `SELECT r.uid, COALESCE(SUM(c.weight), 0) AS total_weight
       FROM residents r
       LEFT JOIN correlations c ON c.uid = r.uid
       GROUP BY r.uid`
    );

    for (const row of result.rows) {
      const score = Math.min(
        1,
        Number(row.total_weight) / ThreatModelService.WEIGHT_DIVISOR
      );
      await this.db.query(
        "UPDATE residents SET risk_score = $1 WHERE uid = $2",
        [score, row.uid]
      );
      await this.flagService.evaluate(row.uid, score);
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
}
