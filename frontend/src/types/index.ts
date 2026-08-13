/**
 * Frontend types van Overdeheg.
 * Dit zijn de vormen zoals ze via JSON van de API binnenkomen,
 * datums zijn daarom strings in plaats van Date-objecten.
 */

/** Risiconiveau van een bewoner, bepaalt de weergave op de kaart. */
export type FlagLevel = "laag" | "verhoogd" | "kritiek";

/** Ernst van een regel in het systeemlog. */
export type LogLevel = "info" | "waarschuwing" | "alarm";

/** Een zone van de wijk op het 3x2 raster van de kaart. */
export interface Zone {
  id: number;
  name: string;
  gridX: number;
  gridY: number;
}

/** Een bericht zoals het in de chatfeed wordt getoond. */
export interface Message {
  id: number;
  uid: string;
  zoneId: number;
  content: string;
  isDeleted: boolean;
  createdAt: string;
}

/** Een bewoner zoals die op de kaart wordt getoond. */
export interface ResidentView {
  uid: string;
  zoneId: number;
  riskScore: number;
  flagLevel: FlagLevel;
}

/** Een regel in het systeemlogpaneel. */
export interface SystemLogEntry {
  id: number;
  level: LogLevel;
  message: string;
  createdAt: string;
}

/** Body die de frontend stuurt bij het plaatsen van een bericht. */
export interface CreateMessagePayload {
  uid: string;
  content: string;
  latitude: number;
  longitude: number;
  hesitationMs: number;
  editCount: number;
}

/** Body die de frontend stuurt bij een GPS-ping. */
export interface CreatePingPayload {
  uid: string;
  latitude: number;
  longitude: number;
}
