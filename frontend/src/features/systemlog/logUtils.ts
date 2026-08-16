import { LogLevel, SystemLogEntry } from "../../types";
import { FormattedLogLine } from "../../types/systemLog";

const LEVEL_LABEL: Record<LogLevel, string> = {
  info: "INFO",
  waarschuwing: "WAARSCHUWING",
  alarm: "ALARM"
};

/**
 * Formatteert een ISO-tijdstempel voor het terminalpaneel.
 */
export function formatLogTime(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return "--:--:--";
  }
  return date.toLocaleTimeString("nl-NL", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}

/**
 * Zet een logregel uit de API om naar een terminalregel.
 */
export function formatLogEntry(entry: SystemLogEntry): FormattedLogLine {
  return {
    id: entry.id,
    level: entry.level,
    levelLabel: LEVEL_LABEL[entry.level],
    timestamp: formatLogTime(entry.createdAt),
    message: entry.message
  };
}
