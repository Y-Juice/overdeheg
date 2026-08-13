import { Pool } from "pg";
import { CreateMessageRequest, MessageView } from "../types/api";
import { NLPService } from "./NLPService";
import { SystemLogService } from "./SystemLogService";
import { ValidationError } from "./validation/ValidationError";
import { Validator } from "./validation/Validator";

interface MessageRow {
  id: number;
  uid: string;
  zone_id: number;
  content: string;
  is_deleted: boolean;
  created_at: Date;
}

/**
 * Beheert het aanmaken van berichten in de buurtchat.
 * Elke body wordt eerst gevalideerd en geschoond, daarna wordt het bericht
 * samen met de stil gelogde gedragsmetadata opgeslagen.
 */
export class MessageService {
  constructor(
    private readonly db: Pool,
    private readonly validator: Validator<CreateMessageRequest>,
    private readonly nlp: NLPService,
    private readonly systemLog: SystemLogService
  ) {}

  /**
   * Valideert de invoer, slaat het bericht op en analyseert de tekst.
   * Beladen termen worden stilletjes in het systeemlog vastgelegd.
   */
  async createMessage(input: unknown): Promise<MessageView> {
    const request = this.validator.validate(input);

    const resident = await this.db.query<{ zone_id: number }>(
      "SELECT zone_id FROM residents WHERE uid = $1",
      [request.uid]
    );
    if (resident.rows.length === 0) {
      throw new ValidationError("Onbekende bewoner, stuur eerst een locatieping");
    }
    const zoneId = resident.rows[0].zone_id;

    const inserted = await this.db.query<MessageRow>(
      `INSERT INTO messages
         (uid, zone_id, content, latitude, longitude, hesitation_ms, edit_count)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, uid, zone_id, content, is_deleted, created_at`,
      [
        request.uid,
        zoneId,
        request.content,
        request.latitude,
        request.longitude,
        request.hesitationMs,
        request.editCount
      ]
    );
    const row = inserted.rows[0];

    const analysis = this.nlp.analyse(request.content);
    if (analysis.chargedTerms.length > 0) {
      await this.systemLog.log(
        "waarschuwing",
        `Bericht ${row.id} bevat beladen termen: ${analysis.chargedTerms.join(", ")}`
      );
    }

    return {
      id: row.id,
      uid: row.uid,
      zoneId: row.zone_id,
      content: row.content,
      isDeleted: row.is_deleted,
      createdAt: row.created_at
    };
  }
}
