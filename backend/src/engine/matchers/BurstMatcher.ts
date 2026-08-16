import { Pool } from "pg";
import { CorrelationMatch } from "../../types/domain";
import { CorrelationMatcher } from "./CorrelationMatcher";

interface BurstRow {
  uid: string;
  burst_count: string;
}

/**
 * Vindt bewoners die in korte tijd veel berichten plaatsen.
 * Een burst is een voorspellend signaal voor oplopende spanning.
 */
export class BurstMatcher implements CorrelationMatcher {
  readonly matchType = "burst" as const;

  constructor(private readonly db: Pool) {}

  async findMatches(): Promise<CorrelationMatch[]> {
    const result = await this.db.query<BurstRow>(
      `SELECT uid, COUNT(*)::text AS burst_count
       FROM messages
       WHERE created_at >= NOW() - INTERVAL '30 minutes'
       GROUP BY uid
       HAVING COUNT(*) >= 8`
    );

    return result.rows.map((row) => {
      const count = Number(row.burst_count);
      return {
        uid: row.uid,
        matchType: this.matchType,
        weight: Math.min(0.4, count / 20),
        details: `${count} berichten in de laatste 30 minuten`
      };
    });
  }
}
