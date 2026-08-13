import { Pool } from "pg";
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
}
