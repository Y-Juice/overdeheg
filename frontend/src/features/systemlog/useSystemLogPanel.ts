import { useMemo } from "react";
import { useAppStore } from "../../stores/appStore";
import { FormattedLogLine } from "../../types/systemLog";
import { formatLogEntry } from "./logUtils";

/**
 * Levert de geformatteerde systeemlogregels voor het terminalpaneel.
 * Oudste eerst, zodat nieuwe regels onderaan verschijnen.
 */
export function useSystemLogPanel(): {
  lines: FormattedLogLine[];
  isEmpty: boolean;
} {
  const entries = useAppStore((state) => state.systemLog);

  const lines = useMemo(
    () => [...entries].reverse().map((entry) => formatLogEntry(entry)),
    [entries]
  );

  return {
    lines,
    isEmpty: lines.length === 0
  };
}
