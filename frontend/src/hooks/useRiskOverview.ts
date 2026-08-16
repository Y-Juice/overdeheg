import { useCallback, useEffect } from "react";
import { useAppStore } from "../stores/appStore";
import { fetchRiskOverview } from "../utils/api";

const REFRESH_MS = 10_000;

/**
 * Laadt het risico-overzicht en vernieuwt het periodiek.
 */
export function useRiskOverview(): void {
  const setRiskOverview = useAppStore((state) => state.setRiskOverview);
  const setError = useAppStore((state) => state.setError);

  const load = useCallback(async () => {
    try {
      const overview = await fetchRiskOverview();
      setRiskOverview(overview);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Risico-overzicht laden mislukt"
      );
    }
  }, [setError, setRiskOverview]);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => {
      void load();
    }, REFRESH_MS);
    return () => window.clearInterval(timer);
  }, [load]);
}
