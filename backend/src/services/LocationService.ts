import { Pool } from "pg";
import { CreatePingRequest, PingView } from "../types/api";
import { SystemLogService } from "./SystemLogService";
import { Validator } from "./validation/Validator";
import { ZoneService } from "./ZoneService";

/**
 * Verwerkt GPS-pings van bewoners.
 * Elke ping wordt gevalideerd, aan een zone gekoppeld en opgeslagen.
 * Onbekende UID's worden hier als nieuwe bewoner geregistreerd.
 */
export class LocationService {
  constructor(
    private readonly db: Pool,
    private readonly validator: Validator<CreatePingRequest>,
    private readonly zoneService: ZoneService,
    private readonly systemLog: SystemLogService
  ) {}

  /**
   * Valideert de ping, leidt de zone af en slaat de ping op.
   * Nieuwe bewoners worden aangemaakt, bestaande verhuizen mee naar hun zone.
   */
  async createPing(input: unknown): Promise<PingView> {
    const request = this.validator.validate(input);
    const zone = await this.zoneService.deriveZone(
      request.latitude,
      request.longitude
    );

    const existing = await this.db.query<{ uid: string }>(
      "SELECT uid FROM residents WHERE uid = $1",
      [request.uid]
    );

    if (existing.rows.length === 0) {
      await this.db.query(
        "INSERT INTO residents (uid, zone_id) VALUES ($1, $2)",
        [request.uid, zone.id]
      );
      await this.systemLog.log(
        "info",
        `Nieuwe bewoner geregistreerd in zone ${zone.name}`
      );
    } else {
      await this.db.query("UPDATE residents SET zone_id = $1 WHERE uid = $2", [
        zone.id,
        request.uid
      ]);
    }

    await this.db.query(
      `INSERT INTO location_pings (uid, latitude, longitude, zone_id)
       VALUES ($1, $2, $3, $4)`,
      [request.uid, request.latitude, request.longitude, zone.id]
    );

    return { uid: request.uid, zoneId: zone.id, zoneName: zone.name };
  }
}
