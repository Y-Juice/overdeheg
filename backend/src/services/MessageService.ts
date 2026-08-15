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
 * Beheert berichten in de buurtchat: aanmaken, ophalen per zone en soft delete.
 * Elke insert wordt eerst gevalideerd en geschoond, daarna wordt het bericht
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

    return this.toView(row);
  }

  /**
   * Geeft alle berichten van een zone, inclusief soft-deleted berichten,
   * of null wanneer de zone niet bestaat.
   */
  async getMessagesByZone(zoneId: number): Promise<MessageView[] | null> {
    const zone = await this.db.query("SELECT id FROM zones WHERE id = $1", [
      zoneId
    ]);
    if (zone.rows.length === 0) {
      return null;
    }

    const result = await this.db.query<MessageRow>(
      `SELECT id, uid, zone_id, content, is_deleted, created_at
       FROM messages
       WHERE zone_id = $1
       ORDER BY created_at ASC`,
      [zoneId]
    );
    return result.rows.map((row) => this.toView(row));
  }

  /**
   * Markeert een bericht als verwijderd zonder de rij te wissen.
   * Geeft null terug wanneer het bericht niet bestaat.
   */
  async softDelete(messageId: number): Promise<MessageView | null> {
    const existing = await this.db.query<MessageRow>(
      `SELECT id, uid, zone_id, content, is_deleted, created_at
       FROM messages
       WHERE id = $1`,
      [messageId]
    );
    if (existing.rows.length === 0) {
      return null;
    }

    const current = existing.rows[0];
    if (current.is_deleted) {
      return this.toView(current);
    }

    const updated = await this.db.query<MessageRow>(
      `UPDATE messages
       SET is_deleted = TRUE, deleted_at = now()
       WHERE id = $1
       RETURNING id, uid, zone_id, content, is_deleted, created_at`,
      [messageId]
    );
    const row = updated.rows[0];
    await this.systemLog.log("info", `Bericht ${row.id} is verwijderd`);
    return this.toView(row);
  }

  /** Zet een databasrij om naar de publieke berichtvorm. */
  private toView(row: MessageRow): MessageView {
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
