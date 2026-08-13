import { Pool } from "pg";
import { SystemLogService } from "../services/SystemLogService";
import { CorrelationMatch } from "../types/domain";
import { CorrelationMatcher } from "./matchers/CorrelationMatcher";

/**
 * Draait periodiek alle correlatiematchers en schrijft het resultaat
 * als verse momentopname naar de correlations tabel.
 * De engine kent de matchers alleen via hun contract,
 * nieuwe soorten verbanden vragen dus geen aanpassing hier.
 */
export class CorrelationEngine {
  private lastMatchCount = -1;

  constructor(
    private readonly db: Pool,
    private readonly matchers: CorrelationMatcher[],
    private readonly systemLog: SystemLogService
  ) {}

  /** Voert een scan uit en vervangt de opgeslagen correlaties. */
  async runScan(): Promise<number> {
    const matches: CorrelationMatch[] = [];
    for (const matcher of this.matchers) {
      matches.push(...(await matcher.findMatches()));
    }

    const client = await this.db.connect();
    try {
      await client.query("BEGIN");
      await client.query("DELETE FROM correlations");
      for (const match of matches) {
        await client.query(
          `INSERT INTO correlations (uid, match_type, weight, details)
           VALUES ($1, $2, $3, $4)`,
          [match.uid, match.matchType, match.weight, match.details]
        );
      }
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }

    if (matches.length !== this.lastMatchCount) {
      await this.systemLog.log(
        "info",
        `Correlatiescan voltooid: ${matches.length} gedragsverbanden gevonden`
      );
      this.lastMatchCount = matches.length;
    }
    return matches.length;
  }

  /** Start de periodieke scan, met direct een eerste run bij het opstarten. */
  start(intervalMs: number): void {
    const safeScan = (): void => {
      this.runScan().catch((error) => {
        console.error("Correlatiescan mislukt", error);
      });
    };
    safeScan();
    setInterval(safeScan, intervalMs);
  }
}
