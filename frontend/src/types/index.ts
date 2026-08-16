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

/** Antwoord op een locatieping: de zone waar de bewoner is ingedeeld. */
export interface PingView {
  uid: string;
  zoneId: number;
  zoneName: string;
}

/** Foutvorm die de API teruggeeft. */
export interface ApiError {
  error: string;
}

/** Startvragen die een vertakt buurtgesprek kunnen beginnen. */
export interface DialoguePromptsResponse {
  prompts: string[];
}

/** Soorten correlatiesignalen uit de engine. */
export type CorrelationMatchType =
  | "hesitation"
  | "edit_pattern"
  | "deletion"
  | "movement"
  | "keyword"
  | "night_activity"
  | "burst";

/** Totalen bovenaan het risicopaneel. */
export interface RiskTotals {
  residentCount: number;
  averageRisk: number;
  flaggedCount: number;
  criticalCount: number;
  messageCount: number;
  pingCount: number;
  correlationCount: number;
}

/** Risico-samenvatting van één zone. */
export interface ZoneRisk {
  zoneId: number;
  zoneName: string;
  residentCount: number;
  averageRisk: number;
  maxRisk: number;
  flaggedCount: number;
}

/** Bewoner in de risicoranking. */
export interface ResidentRisk {
  uid: string;
  zoneId: number;
  zoneName: string;
  riskScore: number;
  flagLevel: FlagLevel;
}

/** Aantal correlaties per matchtype. */
export interface SignalStat {
  matchType: CorrelationMatchType;
  count: number;
  totalWeight: number;
}

/** Aantal bewoners per vlagniveau. */
export interface FlagStat {
  level: FlagLevel;
  count: number;
}

/** Voorspeld risico van een zone. */
export interface ZoneForecast {
  zoneId: number;
  zoneName: string;
  currentRisk: number;
  predictedRisk: number;
  trend: "stijgend" | "stabiel" | "dalend";
  reason: string;
}

/** Patrouilleadvies voor een zone. */
export interface PatrolAdvice {
  zoneId: number;
  zoneName: string;
  predictedRisk: number;
  action: string;
}

/** Bewoner op de watchlist. */
export interface WatchItem {
  uid: string;
  zoneName: string;
  riskScore: number;
  flagLevel: FlagLevel;
  escalateChance: number;
  reason: string;
}

/** Verwacht incident. */
export interface PredictedIncident {
  title: string;
  zoneName: string;
  likelihood: number;
  detail: string;
}

/** Predictieve politie-aggregatie. */
export interface Predictions {
  hotZoneCount: number;
  watchCount: number;
  zones: ZoneForecast[];
  patrols: PatrolAdvice[];
  watchlist: WatchItem[];
  incidents: PredictedIncident[];
}

/** Volledig risico-overzicht voor visualisatie. */
export interface RiskOverview {
  totals: RiskTotals;
  zones: ZoneRisk[];
  residents: ResidentRisk[];
  signals: SignalStat[];
  flags: FlagStat[];
  predictions: Predictions;
}
