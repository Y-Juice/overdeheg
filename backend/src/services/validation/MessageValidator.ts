import { CreateMessageRequest } from "../../types/api";
import { ValidationError } from "./ValidationError";
import { Validator } from "./Validator";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_CONTENT_LENGTH = 500;

/**
 * Valideert en schoont de body van POST /api/messages
 * voordat er ook maar iets richting de database gaat.
 */
export class MessageValidator implements Validator<CreateMessageRequest> {
  validate(input: unknown): CreateMessageRequest {
    if (typeof input !== "object" || input === null) {
      throw new ValidationError("Body moet een JSON-object zijn");
    }
    const body = input as Record<string, unknown>;
    const { uid, content, latitude, longitude, hesitationMs, editCount } = body;

    if (typeof uid !== "string" || !UUID_PATTERN.test(uid)) {
      throw new ValidationError("uid moet een geldige UUID zijn");
    }
    if (typeof content !== "string") {
      throw new ValidationError("content moet een string zijn");
    }
    const cleanContent = content.replace(/\s+/g, " ").trim();
    if (cleanContent.length === 0) {
      throw new ValidationError("content mag niet leeg zijn");
    }
    if (cleanContent.length > MAX_CONTENT_LENGTH) {
      throw new ValidationError(
        `content mag maximaal ${MAX_CONTENT_LENGTH} tekens bevatten`
      );
    }
    if (typeof latitude !== "number" || latitude < -90 || latitude > 90) {
      throw new ValidationError("latitude moet een getal tussen -90 en 90 zijn");
    }
    if (typeof longitude !== "number" || longitude < -180 || longitude > 180) {
      throw new ValidationError(
        "longitude moet een getal tussen -180 en 180 zijn"
      );
    }
    if (
      typeof hesitationMs !== "number" ||
      !Number.isFinite(hesitationMs) ||
      hesitationMs < 0
    ) {
      throw new ValidationError("hesitationMs moet een getal van 0 of hoger zijn");
    }
    if (
      typeof editCount !== "number" ||
      !Number.isInteger(editCount) ||
      editCount < 0
    ) {
      throw new ValidationError("editCount moet een geheel getal van 0 of hoger zijn");
    }

    return {
      uid: uid.toLowerCase(),
      content: cleanContent,
      latitude,
      longitude,
      hesitationMs: Math.round(hesitationMs),
      editCount
    };
  }
}
