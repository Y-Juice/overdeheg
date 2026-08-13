import { Pool } from "pg";
import { ResidentView } from "../types/api";
import { FlagLevel } from "../types/domain";

interface ResidentRow {
  uid: string;
  zone_id: number;
  risk_score: number;
  level: FlagLevel;
}

/**
 * Leest bewoners met hun actuele dreigingsniveau uit de database,
 * zodat de kaart per zone kan tonen wie er is en hoe die wordt ingeschat.
 */
export class ResidentService {
  constructor(private readonly db: Pool) {}

  /**
   * Geeft alle bewoners van een zone met hun laatste vlagniveau,
   * of null wanneer de zone niet bestaat.
   */
  async getResidentsByZone(zoneId: number): Promise<ResidentView[] | null> {
    const zone = await this.db.query("SELECT id FROM zones WHERE id = $1", [
      zoneId
    ]);
    if (zone.rows.length === 0) {
      return null;
    }

    const result = await this.db.query<ResidentRow>(
      `SELECT r.uid, r.zone_id, r.risk_score, COALESCE(f.level, 'laag') AS level
       FROM residents r
       LEFT JOIN LATERAL (
         SELECT level FROM flags
         WHERE uid = r.uid
         ORDER BY id DESC
         LIMIT 1
       ) f ON TRUE
       WHERE r.zone_id = $1
       ORDER BY r.risk_score DESC`,
      [zoneId]
    );

    return result.rows.map((row) => ({
      uid: row.uid,
      zoneId: row.zone_id,
      riskScore: row.risk_score,
      flagLevel: row.level
    }));
  }
}
