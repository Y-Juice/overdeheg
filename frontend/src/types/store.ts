import { Message, ResidentView, RiskOverview, SystemLogEntry, Zone } from "./index";

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
  homeZoneId: number | null;
  homeZoneName: string | null;
}

/** Volledige clientstaat die de hooks in de store bijhouden. */
export interface AppState {
  session: Session;
  zones: Zone[];
  messages: Message[];
  residents: ResidentView[];
  systemLog: SystemLogEntry[];
  riskOverview: RiskOverview | null;
  error: string | null;
}
