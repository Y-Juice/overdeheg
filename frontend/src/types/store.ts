import { Message, ResidentView, SystemLogEntry, Zone } from "./index";

/**
 * Sessie van de lokale bewoner.
 * De UID blijft hetzelfde zodat alle data per persoon te onderscheiden is.
 */
export interface Session {
  uid: string;
  latitude: number;
  longitude: number;
  zoneId: number | null;
  zoneName: string | null;
}

/** Volledige clientstaat die de hooks in de store bijhouden. */
export interface AppState {
  session: Session;
  zones: Zone[];
  messages: Message[];
  residents: ResidentView[];
  systemLog: SystemLogEntry[];
  error: string | null;
}
