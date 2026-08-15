import { FlagLevel } from "./index";

/** Intensiteit van de heat overlay, afgeleid van de gemiddelde risicoscore. */
export type HeatLevel = 0 | 1 | 2 | 3 | 4;

/** Samenvatting van een zone voor de kaart en de tooltip. */
export interface ZoneSummary {
  zoneId: number;
  zoneName: string;
  residentCount: number;
  averageRisk: number;
  highestFlag: FlagLevel;
  heatLevel: HeatLevel;
}
