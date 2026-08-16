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
 * Verkort een UID tot een anonieme weergave in de chat.
 */
export function shortUid(uid: string): string {
  return uid.slice(0, 8);
}
