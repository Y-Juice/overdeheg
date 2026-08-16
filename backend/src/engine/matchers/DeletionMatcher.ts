import { Pool } from "pg";
import { CorrelationMatch } from "../../types/domain";
import { CorrelationMatcher } from "./CorrelationMatcher";

interface DeletionRow {
  uid: string;
  deleted_count: string;
  total_count: string;
}

/**
 * Zoekt bewoners die eerder geplaatste berichten weer verwijderen.
 * Verwijdergedrag wordt gelezen als het achteraf verbergen van sporen.
 */
export class DeletionMatcher implements CorrelationMatcher {
  readonly matchType = "deletion";

  constructor(private readonly db: Pool) {}

  async findMatches(): Promise<CorrelationMatch[]> {
    const result = await this.db.query<DeletionRow>(
      `SELECT uid,
              COUNT(*) FILTER (WHERE is_deleted) AS deleted_count,
              COUNT(*) AS total_count
       FROM messages
       WHERE created_at > now() - interval '24 hours'
       GROUP BY uid
       HAVING COUNT(*) FILTER (WHERE is_deleted) >= 2`
    );

    return result.rows.map((row) => {
      const deleted = Number(row.deleted_count);
      const total = Number(row.total_count);
      return {
        uid: row.uid,
        matchType: this.matchType,
        weight: Math.min(0.4, (deleted / total) * 0.7),
        details: `${deleted} van de ${total} berichten verwijderd`
      };
    });
  }
}
