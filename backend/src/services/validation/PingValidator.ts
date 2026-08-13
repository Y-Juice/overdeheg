import { CreatePingRequest } from "../../types/api";
import { ValidationError } from "./ValidationError";
import { Validator } from "./Validator";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Valideert en schoont de body van POST /api/pings
 * voordat de ping wordt opgeslagen.
 */
export class PingValidator implements Validator<CreatePingRequest> {
  validate(input: unknown): CreatePingRequest {
    if (typeof input !== "object" || input === null) {
      throw new ValidationError("Body moet een JSON-object zijn");
    }
    const body = input as Record<string, unknown>;
    const { uid, latitude, longitude } = body;

    if (typeof uid !== "string" || !UUID_PATTERN.test(uid)) {
      throw new ValidationError("uid moet een geldige UUID zijn");
    }
    if (typeof latitude !== "number" || latitude < -90 || latitude > 90) {
      throw new ValidationError("latitude moet een getal tussen -90 en 90 zijn");
    }
    if (typeof longitude !== "number" || longitude < -180 || longitude > 180) {
      throw new ValidationError(
        "longitude moet een getal tussen -180 en 180 zijn"
      );
    }

    return { uid: uid.toLowerCase(), latitude, longitude };
  }
}
