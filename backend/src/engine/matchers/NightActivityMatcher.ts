import { Pool } from "pg";
import { CorrelationMatch } from "../../types/domain";
import { CorrelationMatcher } from "./CorrelationMatcher";

interface NightRow {
  uid: string;
  night_count: string;
}

/**
 * Vindt bewoners die 's nachts (22:00-06:00) berichten plaatsen.
 * Dat patroon telt als voorspellend signaal voor verhoogde aandacht.
 */
export class NightActivityMatcher implements CorrelationMatcher {
  readonly matchType = "night_activity" as const;

  constructor(private readonly db: Pool) {}

  async findMatches(): Promise<CorrelationMatch[]> {
    const result = await this.db.query<NightRow>(
      `SELECT uid, COUNT(*)::text AS night_count
       FROM messages
       WHERE created_at > now() - interval '48 hours'
         AND (EXTRACT(HOUR FROM created_at) >= 22
          OR EXTRACT(HOUR FROM created_at) < 6)
       GROUP BY uid
       HAVING COUNT(*) >= 2`
    );

    return result.rows.map((row) => {
      const count = Number(row.night_count);
      return {
        uid: row.uid,
        matchType: this.matchType,
        weight: Math.min(1, count / 6),
        details: `${count} nachtberichten tussen 22:00 en 06:00`
      };
    });
  }
}
