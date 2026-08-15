import { Pool } from "pg";
import { SystemLogView } from "../types/api";
import { LogLevel } from "../types/domain";

/**
 * Schrijft regels naar het systeemlog in de database.
 * Andere services gebruiken dit om observaties vast te leggen
 * die later in het terminalpaneel van de frontend verschijnen.
 */
export class SystemLogService {
  constructor(private readonly db: Pool) {}

  /** Voegt een regel toe aan het systeemlog. */
  async log(level: LogLevel, message: string): Promise<void> {
    await this.db.query(
      "INSERT INTO system_log (level, message) VALUES ($1, $2)",
      [level, message]
    );
  }

  /**
   * Geeft de nieuwste regels uit het systeemlog, nieuwste eerst.
   * De limiet wordt begrensd zodat de frontend niet overspoeld raakt.
   */
  async listRecent(limit: number): Promise<SystemLogView[]> {
    const safeLimit = Math.min(Math.max(Math.floor(limit), 1), 200);
    const result = await this.db.query<{
      id: number;
      level: LogLevel;
      message: string;
      created_at: Date;
    }>(
      `SELECT id, level, message, created_at
       FROM system_log
       ORDER BY id DESC
       LIMIT $1`,
      [safeLimit]
    );

    return result.rows.map((row) => ({
      id: row.id,
      level: row.level,
      message: row.message,
      createdAt: row.created_at
    }));
  }
}
