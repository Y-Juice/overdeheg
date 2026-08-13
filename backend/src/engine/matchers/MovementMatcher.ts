import { Pool } from "pg";
import { CorrelationMatch } from "../../types/domain";
import { CorrelationMatcher } from "./CorrelationMatcher";

const MIN_DISTINCT_ZONES = 3;
const TOTAL_ZONES = 6;

interface MovementRow {
  uid: string;
  zone_count: string;
}

/**
 * Zoekt bewoners die zich binnen een dag door opvallend veel zones bewegen.
 * Veel verplaatsing wordt gelezen als doelbewust rondtrekken.
 */
export class MovementMatcher implements CorrelationMatcher {
  readonly matchType = "movement";

  constructor(private readonly db: Pool) {}

  async findMatches(): Promise<CorrelationMatch[]> {
    const result = await this.db.query<MovementRow>(
      `SELECT uid, COUNT(DISTINCT zone_id) AS zone_count
       FROM location_pings
       WHERE created_at > now() - interval '24 hours'
       GROUP BY uid
       HAVING COUNT(DISTINCT zone_id) >= $1`,
      [MIN_DISTINCT_ZONES]
    );

    return result.rows.map((row) => {
      const zoneCount = Number(row.zone_count);
      return {
        uid: row.uid,
        matchType: this.matchType,
        weight: Math.min(1, zoneCount / TOTAL_ZONES),
        details: `Actief in ${zoneCount} verschillende zones binnen 24 uur`
      };
    });
  }
}
