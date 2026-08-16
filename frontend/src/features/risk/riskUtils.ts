import { CorrelationMatchType, FlagLevel } from "../../types";

/** Formatteert een risicoscore als percentage. */
export function formatRiskPercent(score: number): string {
  return `${Math.round(score * 100)}%`;
}

/** Breedte van een balk op basis van een score tussen 0 en 1. */
export function barWidth(score: number): string {
  const clamped = Math.max(0, Math.min(1, score));
  return `${Math.round(clamped * 100)}%`;
}

/** Nederlandse label voor een correlatietype. */
export function signalLabel(matchType: CorrelationMatchType): string {
  if (matchType === "hesitation") {
    return "Aarzeling";
  }
  if (matchType === "edit_pattern") {
    return "Bewerkingen";
  }
  if (matchType === "deletion") {
    return "Verwijderingen";
  }
  if (matchType === "movement") {
    return "Beweging";
  }
  if (matchType === "night_activity") {
    return "Nachtactiviteit";
  }
  if (matchType === "burst") {
    return "Berichtburst";
  }
  return "Sleutelwoorden";
}

/** Nederlandse label voor een risicotrend. */
export function trendLabel(trend: "stijgend" | "stabiel" | "dalend"): string {
  if (trend === "stijgend") {
    return "stijgend";
  }
  if (trend === "dalend") {
    return "dalend";
  }
  return "stabiel";
}

/** CSS-klasse-achtervoegsel voor een vlagniveau. */
export function flagTone(level: FlagLevel): "low" | "raised" | "critical" {
  if (level === "kritiek") {
    return "critical";
  }
  if (level === "verhoogd") {
    return "raised";
  }
  return "low";
}

/** Kleurtoon op basis van risicoscore. */
export function riskTone(score: number): "low" | "raised" | "critical" {
  if (score >= 0.7) {
    return "critical";
  }
  if (score >= 0.4) {
    return "raised";
  }
  return "low";
}
