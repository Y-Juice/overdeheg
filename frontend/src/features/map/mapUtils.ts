import { FlagLevel, ResidentView, Zone } from "../../types";
import { HeatLevel, ZoneSummary } from "../../types/map";

const FLAG_RANK: Record<FlagLevel, number> = {
  laag: 0,
  verhoogd: 1,
  kritiek: 2
};

/**
 * Zet een gemiddelde risicoscore om naar een van vijf heat-niveaus.
 */
export function toHeatLevel(averageRisk: number): HeatLevel {
  if (averageRisk <= 0) {
    return 0;
  }
  if (averageRisk < 0.2) {
    return 1;
  }
  if (averageRisk < 0.4) {
    return 2;
  }
  if (averageRisk < 0.7) {
    return 3;
  }
  return 4;
}

/**
 * Kiest het hoogste dreigingsniveau uit een lijst bewoners.
 */
export function highestFlag(residents: ResidentView[]): FlagLevel {
  let current: FlagLevel = "laag";
  for (const resident of residents) {
    if (FLAG_RANK[resident.flagLevel] > FLAG_RANK[current]) {
      current = resident.flagLevel;
    }
  }
  return current;
}

/**
 * Bouwt de samenvatting van een zone voor heat overlay en tooltip.
 */
export function summarizeZone(zone: Zone, residents: ResidentView[]): ZoneSummary {
  const inZone = residents.filter((resident) => resident.zoneId === zone.id);
  const totalRisk = inZone.reduce((sum, resident) => sum + resident.riskScore, 0);
  const averageRisk = inZone.length === 0 ? 0 : totalRisk / inZone.length;

  return {
    zoneId: zone.id,
    zoneName: zone.name,
    residentCount: inZone.length,
    averageRisk,
    highestFlag: highestFlag(inZone),
    heatLevel: toHeatLevel(averageRisk)
  };
}

/**
 * Zet een UID om naar een vaste plek in het 3x3 raster van een zone.
 */
export function positionIndex(uid: string): number {
  let hash = 0;
  for (let index = 0; index < uid.length; index += 1) {
    hash = (hash + uid.charCodeAt(index)) % 9;
  }
  return hash;
}

/** Nederlandse weergave van een dreigingsniveau. */
export function flagLabel(level: FlagLevel): string {
  if (level === "kritiek") {
    return "kritiek";
  }
  if (level === "verhoogd") {
    return "verhoogd";
  }
  return "laag";
}
