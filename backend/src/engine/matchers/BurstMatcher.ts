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
       WHERE created_at >= NOW() - INTERVAL '45 minutes'
       GROUP BY uid
       HAVING COUNT(*) >= 3`
    );

    return result.rows.map((row) => {
      const count = Number(row.burst_count);
      return {
        uid: row.uid,
        matchType: this.matchType,
        weight: Math.min(1, count / 8),
        details: `${count} berichten in de laatste 45 minuten`
      };
    });
  }
}
