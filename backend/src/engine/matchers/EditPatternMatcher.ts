import { Pool } from "pg";
import { CorrelationMatch } from "../../types/domain";
import { CorrelationMatcher } from "./CorrelationMatcher";

const MIN_AVG_EDITS = 1.5;
const MAX_WEIGHT_AT_EDITS = 5;

interface EditRow {
  uid: string;
  avg_edits: string;
  message_count: string;
}

/**
 * Zoekt bewoners die hun berichten opvallend vaak herschrijven.
 * Veel bewerkingen wijzen op het zorgvuldig afwegen van woorden.
 */
export class EditPatternMatcher implements CorrelationMatcher {
  readonly matchType = "edit_pattern";

  constructor(private readonly db: Pool) {}

  async findMatches(): Promise<CorrelationMatch[]> {
    const result = await this.db.query<EditRow>(
      `SELECT uid, AVG(edit_count) AS avg_edits, COUNT(*) AS message_count
       FROM messages
       WHERE created_at > now() - interval '24 hours'
       GROUP BY uid
       HAVING AVG(edit_count) >= $1`,
      [MIN_AVG_EDITS]
    );

    return result.rows.map((row) => {
      const avgEdits = Number(row.avg_edits);
      return {
        uid: row.uid,
        matchType: this.matchType,
        weight: Math.min(1, avgEdits / MAX_WEIGHT_AT_EDITS),
        details: `Gemiddeld ${avgEdits.toFixed(1)} bewerkingen per bericht over ${row.message_count} berichten`
      };
    });
  }
}
