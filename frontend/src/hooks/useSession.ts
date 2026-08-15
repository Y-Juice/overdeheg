import { useCallback, useEffect } from "react";
import { useAppStore } from "../stores/appStore";
import { createPing } from "../utils/api";
import { loadOrCreateSession } from "../utils/session";

/**
 * Zorgt dat de lokale bewoner een UID en zone heeft.
 * Bij de eerste keer wordt een locatieping naar de backend gestuurd
 * zodat de bewoner in de database verschijnt.
 */
export function useSession(): void {
  const setSession = useAppStore((state) => state.setSession);
  const setError = useAppStore((state) => state.setError);

  const register = useCallback(async () => {
    const session = loadOrCreateSession();
    try {
      const ping = await createPing({
        uid: session.uid,
        latitude: session.latitude,
        longitude: session.longitude
      });
      setSession({
        ...session,
        zoneId: ping.zoneId,
        zoneName: ping.zoneName
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : "Sessie starten mislukt");
    }
  }, [setError, setSession]);

  useEffect(() => {
    void register();
  }, [register]);
}
