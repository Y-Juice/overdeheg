import { USERNAME_BASES } from "./usernameBases";

/**
 * Formatteert een ISO-tijdstempel naar een korte Nederlandse weergave.
 */
export function formatMessageTime(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toLocaleTimeString("nl-NL", {
    hour: "2-digit",
    minute: "2-digit"
  });
}

/**
 * Zet een UID om naar een vast getal, zodat dezelfde bewoner
 * steeds dezelfde weergavenaam krijgt.
 */
function hashUid(uid: string): number {
  let hash = 0;
  for (let index = 0; index < uid.length; index += 1) {
    hash = (hash * 31 + uid.charCodeAt(index)) >>> 0;
  }
  return hash;
}

/**
 * Geeft een realistisch pseudoniem voor een UID, zoals vanessa64 of mrMarcus485.
 * De naam is deterministisch: dezelfde UID houdt altijd dezelfde naam.
 */
export function displayUsername(uid: string): string {
  const hash = hashUid(uid);
  const base = USERNAME_BASES[hash % USERNAME_BASES.length];
  const number = (hash % 900) + 1;
  return `${base}${number}`;
}
