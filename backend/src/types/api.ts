import { FlagLevel } from "./domain";

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

/** Standaard foutvorm die elke route teruggeeft bij een fout. */
export interface ApiError {
  error: string;
}
