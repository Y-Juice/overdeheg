/**
 * Domeintypes van Overdeheg.
 * Deze interfaces komen 1-op-1 overeen met de rijen in de databasetabellen.
 */

/**
 * Soorten correlaties die de CorrelationEngine kan vinden.
 * Nieuwe soorten worden hier toegevoegd zonder bestaande logica aan te passen.
 */
export type CorrelationMatchType =
  | "hesitation"
  | "edit_pattern"
  | "deletion"
  | "movement"
  | "keyword";

/** Risiconiveau van een vlag, wordt direct in de UI getoond. */
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

/** Een anonieme bewoner, herkenbaar aan een UID. */
export interface Resident {
  uid: string;
  zoneId: number;
  riskScore: number;
  createdAt: Date;
}

/** Een bericht in de buurtchat, inclusief stil gelogde metadata. */
export interface Message {
  id: number;
  uid: string;
  zoneId: number;
  content: string;
  latitude: number;
  longitude: number;
  hesitationMs: number;
  editCount: number;
  isDeleted: boolean;
  deletedAt: Date | null;
  createdAt: Date;
}

/** Een GPS-ping van een bewoner. */
export interface LocationPing {
  id: number;
  uid: string;
  latitude: number;
  longitude: number;
  zoneId: number | null;
  createdAt: Date;
}

/** Een gevonden correlatie voor een bewoner. */
export interface Correlation {
  id: number;
  uid: string;
  matchType: CorrelationMatchType;
  weight: number;
  details: string | null;
  createdAt: Date;
}

/** Een risicovlag die het dreigingsmodel aan een bewoner hangt. */
export interface Flag {
  id: number;
  uid: string;
  level: FlagLevel;
  reason: string;
  createdAt: Date;
}

/** Een regel in het systeemlog. */
export interface SystemLogEntry {
  id: number;
  level: LogLevel;
  message: string;
  createdAt: Date;
}
