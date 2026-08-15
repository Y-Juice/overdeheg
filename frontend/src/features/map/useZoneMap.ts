import { useMemo, useState } from "react";
import { useAppStore } from "../../stores/appStore";
import { ResidentView, Zone } from "../../types";
import { ZoneSummary } from "../../types/map";
import { summarizeZone } from "./mapUtils";

/**
 * Levert de kaartstaat: zones met heat-samenvatting, hover en zonekeuze.
 * Componenten lezen alleen deze waarden en sturen klikken hiernaartoe.
 */
export function useZoneMap(): {
  zones: Zone[];
  residents: ResidentView[];
  summaries: ZoneSummary[];
  selectedZoneId: number | null;
  ownZoneId: number | null;
  hoveredZoneId: number | null;
  setHoveredZoneId: (zoneId: number | null) => void;
  selectZone: (zoneId: number, zoneName: string) => void;
} {
  const zones = useAppStore((state) => state.zones);
  const residents = useAppStore((state) => state.residents);
  const selectedZoneId = useAppStore((state) => state.session.zoneId);
  const ownZoneId = useAppStore((state) => state.session.homeZoneId);
  const selectZone = useAppStore((state) => state.selectZone);
  const [hoveredZoneId, setHoveredZoneId] = useState<number | null>(null);

  const summaries = useMemo(
    () => zones.map((zone) => summarizeZone(zone, residents)),
    [residents, zones]
  );

  return {
    zones,
    residents,
    summaries,
    selectedZoneId,
    ownZoneId,
    hoveredZoneId,
    setHoveredZoneId,
    selectZone
  };
}
