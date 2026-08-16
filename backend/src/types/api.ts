import { CorrelationMatchType, FlagLevel, LogLevel } from "./domain";

/**
 * API-types van Overdeheg.
 * Deze interfaces beschrijven de request- en responsebodies van de routes.
 */

/** Body van POST /api/messages. */
export interface CreateMessageRequest {
  uid: string;
  content: string;
  latitude: number;
  longitude: number;
  hesitationMs: number;
  editCount: number;
}

/** Body van POST /api/pings. */
export interface CreatePingRequest {
  uid: string;
  latitude: number;
  longitude: number;
}

/** Antwoord op POST /api/pings: de zone waar de bewoner nu is ingedeeld. */
export interface PingView {
  uid: string;
  zoneId: number;
  zoneName: string;
}

/** Een bericht zoals de frontend het terugkrijgt, zonder de stil gelogde metadata. */
export interface MessageView {
  id: number;
  uid: string;
  zoneId: number;
  content: string;
  isDeleted: boolean;
  createdAt: Date;
}

/** Een bewoner zoals de frontend die te zien krijgt op de kaart. */
export interface ResidentView {
  uid: string;
  zoneId: number;
  riskScore: number;
  flagLevel: FlagLevel;
}

/** Een zone zoals de frontend die op de kaart tekent. */
export interface ZoneView {
  id: number;
  name: string;
  gridX: number;
  gridY: number;
}

/** Een regel uit het systeemlog zoals de frontend die toont. */
export interface SystemLogView {
  id: number;
  level: LogLevel;
  message: string;
  createdAt: Date;
}

/** Standaard foutvorm die elke route teruggeeft bij een fout. */
export interface ApiError {
  error: string;
}

/** Totalen bovenaan het risicopaneel. */
export interface RiskTotalsView {
  residentCount: number;
  averageRisk: number;
  flaggedCount: number;
  criticalCount: number;
  messageCount: number;
  pingCount: number;
  correlationCount: number;
}

/** Risico-samenvatting van één zone. */
export interface ZoneRiskView {
  zoneId: number;
  zoneName: string;
  residentCount: number;
  averageRisk: number;
  maxRisk: number;
  flaggedCount: number;
}

/** Bewoner in de risicoranking. */
export interface ResidentRiskView {
  uid: string;
  zoneId: number;
  zoneName: string;
  riskScore: number;
  flagLevel: FlagLevel;
}

/** Aantal correlaties per matchtype. */
export interface SignalStatView {
  matchType: CorrelationMatchType;
  count: number;
  totalWeight: number;
}

/** Aantal bewoners per vlagniveau. */
export interface FlagStatView {
  level: FlagLevel;
  count: number;
}

/** Voorspeld risico van een zone voor het volgende venster. */
export interface ZoneForecastView {
  zoneId: number;
  zoneName: string;
  currentRisk: number;
  predictedRisk: number;
  trend: "stijgend" | "stabiel" | "dalend";
  reason: string;
}

/** Patrouilleadvies voor een zone. */
export interface PatrolAdviceView {
  zoneId: number;
  zoneName: string;
  predictedRisk: number;
  action: string;
}

/** Bewoner die volgens het model kan escaleren. */
export interface WatchItemView {
  uid: string;
  zoneName: string;
  riskScore: number;
  flagLevel: FlagLevel;
  escalateChance: number;
  reason: string;
}

/** Verwacht incident op basis van recente signalen. */
export interface PredictedIncidentView {
  title: string;
  zoneName: string;
  likelihood: number;
  detail: string;
}

/** Predictieve politie-aggregatie. */
export interface PredictionsView {
  hotZoneCount: number;
  watchCount: number;
  zones: ZoneForecastView[];
  patrols: PatrolAdviceView[];
  watchlist: WatchItemView[];
  incidents: PredictedIncidentView[];
}

/** Volledig risico-overzicht voor visualisatie. */
export interface RiskOverviewView {
  totals: RiskTotalsView;
  zones: ZoneRiskView[];
  residents: ResidentRiskView[];
  signals: SignalStatView[];
  flags: FlagStatView[];
  predictions: PredictionsView;
}
