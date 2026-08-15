import { useCallback, useEffect } from "react";
import { useAppStore } from "../stores/appStore";
import { fetchResidents } from "../utils/api";

const REFRESH_MS = 10_000;

/**
 * Laadt de bewoners van alle zones, inclusief hun risicoscore.
 * De kaart heeft alle zones nodig; de chat filtert later op de actieve zone.
 * Vernieuwt periodiek zodat het dreigingsmodel zichtbaar blijft.
 */
export function useResidents(): void {
  const zones = useAppStore((state) => state.zones);
  const setResidents = useAppStore((state) => state.setResidents);
  const setError = useAppStore((state) => state.setError);

  const load = useCallback(async () => {
    if (zones.length === 0) {
      return;
    }
    try {
      const groups = await Promise.all(
        zones.map((zone) => fetchResidents(zone.id))
      );
      setResidents(groups.flat());
    } catch (error) {
      setError(error instanceof Error ? error.message : "Bewoners laden mislukt");
    }
  }, [setError, setResidents, zones]);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => {
      void load();
    }, REFRESH_MS);
    return () => window.clearInterval(timer);
  }, [load]);
}
