import { useCallback, useEffect } from "react";
import { useAppStore } from "../stores/appStore";
import { fetchZones } from "../utils/api";

/**
 * Laadt de zones uit de database en zet ze in de store.
 */
export function useZones(): void {
  const setZones = useAppStore((state) => state.setZones);
  const setError = useAppStore((state) => state.setError);

  const load = useCallback(async () => {
    try {
      const zones = await fetchZones();
      setZones(zones);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Zones laden mislukt");
    }
  }, [setError, setZones]);

  useEffect(() => {
    void load();
  }, [load]);
}
