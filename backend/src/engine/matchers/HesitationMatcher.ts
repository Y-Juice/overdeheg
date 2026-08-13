import { Pool } from "pg";
import { CorrelationMatch } from "../../types/domain";
import { CorrelationMatcher } from "./CorrelationMatcher";

const MIN_AVG_HESITATION_MS = 3000;
const MAX_WEIGHT_AT_MS = 10000;

interface HesitationRow {
  uid: string;
  avg_hesitation: string;
  message_count: string;
}

/**
 * Zoekt bewoners die opvallend lang twijfelen voordat ze een bericht plaatsen.
 * Lange aarzeltijd wordt gelezen als zelfcensuur.
 */
export class HesitationMatcher implements CorrelationMatcher {
  readonly matchType = "hesitation";

  constructor(private readonly db: Pool) {}

  async findMatches(): Promise<CorrelationMatch[]> {
    const result = await this.db.query<HesitationRow>(
      `SELECT uid, AVG(hesitation_ms) AS avg_hesitation, COUNT(*) AS message_count
       FROM messages
       GROUP BY uid
       HAVING AVG(hesitation_ms) >= $1`,
      [MIN_AVG_HESITATION_MS]
    );

    return result.rows.map((row) => {
      const avgHesitation = Math.round(Number(row.avg_hesitation));
      return {
        uid: row.uid,
        matchType: this.matchType,
        weight: Math.min(1, avgHesitation / MAX_WEIGHT_AT_MS),
        details: `Gemiddelde aarzeltijd van ${avgHesitation} ms over ${row.message_count} berichten`
      };
    });
  }
}
