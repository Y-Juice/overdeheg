import { Pool } from "pg";
import { FlagLevel } from "../types/domain";
import { SystemLogService } from "./SystemLogService";

const ELEVATED_THRESHOLD = 0.4;
const CRITICAL_THRESHOLD = 0.7;

/**
 * Vertaalt risicoscores naar dreigingsniveaus en houdt de vlaggenhistorie bij.
 * Alleen een verandering van niveau levert een nieuwe vlag op,
 * zodat de historie leesbaar blijft.
 */
export class FlagService {
  constructor(
    private readonly db: Pool,
    private readonly systemLog: SystemLogService
  ) {}

  /** Bepaalt het dreigingsniveau dat bij een risicoscore hoort. */
  levelForScore(score: number): FlagLevel {
    if (score >= CRITICAL_THRESHOLD) {
      return "kritiek";
    }
    if (score >= ELEVATED_THRESHOLD) {
      return "verhoogd";
    }
    return "laag";
  }

  /**
   * Vergelijkt het nieuwe niveau met de laatste vlag van de bewoner
   * en legt een verandering vast in de flags tabel en het systeemlog.
   */
  async evaluate(uid: string, score: number): Promise<FlagLevel> {
    const newLevel = this.levelForScore(score);

    const latest = await this.db.query<{ level: FlagLevel }>(
      "SELECT level FROM flags WHERE uid = $1 ORDER BY id DESC LIMIT 1",
      [uid]
    );
    const currentLevel = latest.rows.length > 0 ? latest.rows[0].level : "laag";

    if (newLevel === currentLevel) {
      return newLevel;
    }

    await this.db.query(
      "INSERT INTO flags (uid, level, reason) VALUES ($1, $2, $3)",
      [uid, newLevel, `Risicoscore is nu ${score.toFixed(2)}`]
    );

    const logLevel =
      newLevel === "kritiek" ? "alarm" : newLevel === "verhoogd" ? "waarschuwing" : "info";
    await this.systemLog.log(
      logLevel,
      `Dreigingsniveau van bewoner ${uid.slice(0, 8)} is nu ${newLevel}`
    );

    return newLevel;
  }
}
