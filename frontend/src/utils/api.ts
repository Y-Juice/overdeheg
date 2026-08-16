import {
  ApiError,
  CreateMessagePayload,
  CreatePingPayload,
  DialoguePromptsResponse,
  Message,
  PingView,
  ResidentView,
  RiskOverview,
  SystemLogEntry,
  Zone
} from "../types";

/**
 * Stuurt een JSON-request naar de backend en gooit bij een fout
 * een Error met de Nederlandse fouttekst van de API.
 */
async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {})
    }
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({
      error: "Onbekende fout"
    }))) as ApiError;
    throw new Error(body.error);
  }

  return (await response.json()) as T;
}

/** Haalt alle zones van de wijk op. */
export function fetchZones(): Promise<Zone[]> {
  return request<Zone[]>("/api/zones");
}

/** Haalt de berichten van een zone op, inclusief verwijderde berichten. */
export function fetchMessages(zoneId: number): Promise<Message[]> {
  return request<Message[]>(`/api/messages?zoneId=${zoneId}`);
}

/** Plaatst een nieuw bericht. */
export function createMessage(payload: CreateMessagePayload): Promise<Message> {
  return request<Message>("/api/messages", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

/** Verwijdert een bericht via soft delete. */
export function deleteMessage(messageId: number): Promise<Message> {
  return request<Message>(`/api/messages/${messageId}`, {
    method: "DELETE"
  });
}

/** Stuurt een GPS-ping en krijgt de afgeleide zone terug. */
export function createPing(payload: CreatePingPayload): Promise<PingView> {
  return request<PingView>("/api/pings", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

/** Haalt de bewoners van een zone op, inclusief risicoscore. */
export function fetchResidents(zoneId: number): Promise<ResidentView[]> {
  return request<ResidentView[]>(`/api/residents/${zoneId}`);
}

/** Haalt de nieuwste regels uit het systeemlog op. */
export function fetchSystemLog(limit = 50): Promise<SystemLogEntry[]> {
  return request<SystemLogEntry[]>(`/api/system-log?limit=${limit}`);
}

/** Haalt de startvragen voor vertakte buurtgesprekken op. */
export function fetchDialoguePrompts(): Promise<string[]> {
  return request<DialoguePromptsResponse>("/api/dialogue/prompts").then(
    (body) => body.prompts
  );
}

/** Haalt het geaggregeerde risico-overzicht voor visualisatie op. */
export function fetchRiskOverview(): Promise<RiskOverview> {
  return request<RiskOverview>("/api/risk/overview");
}
