import { useCallback, useEffect } from "react";
import { useAppStore } from "../stores/appStore";
import { fetchSystemLog } from "../utils/api";

const REFRESH_MS = 5_000;

/**
 * Laadt het systeemlog uit de database en vernieuwt het periodiek.
 */
export function useSystemLog(): void {
  const setSystemLog = useAppStore((state) => state.setSystemLog);
  const setError = useAppStore((state) => state.setError);

  const load = useCallback(async () => {
    try {
      const entries = await fetchSystemLog();
      setSystemLog(entries);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Systeemlog laden mislukt");
    }
  }, [setError, setSystemLog]);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => {
      void load();
    }, REFRESH_MS);
    return () => window.clearInterval(timer);
  }, [load]);
}
