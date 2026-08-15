import { useCallback, useEffect } from "react";
import { useAppStore } from "../stores/appStore";
import { fetchResidents } from "../utils/api";

const REFRESH_MS = 10_000;

/**
 * Laadt de bewoners van de actieve zone, inclusief hun risicoscore.
 * Vernieuwt periodiek zodat het dreigingsmodel zichtbaar blijft.
 */
export function useResidents(): void {
  const zoneId = useAppStore((state) => state.session.zoneId);
  const setResidents = useAppStore((state) => state.setResidents);
  const setError = useAppStore((state) => state.setError);

  const load = useCallback(async () => {
    if (zoneId === null) {
      return;
    }
    try {
      const residents = await fetchResidents(zoneId);
      setResidents(residents);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Bewoners laden mislukt");
    }
  }, [setError, setResidents, zoneId]);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => {
      void load();
    }, REFRESH_MS);
    return () => window.clearInterval(timer);
  }, [load]);
}
