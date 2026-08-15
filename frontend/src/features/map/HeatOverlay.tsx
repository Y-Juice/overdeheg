import { HeatLevel } from "../../types/map";
import styles from "./HeatOverlay.module.css";

const HEAT_CLASS: Record<HeatLevel, string> = {
  0: styles.heat0,
  1: styles.heat1,
  2: styles.heat2,
  3: styles.heat3,
  4: styles.heat4
};

interface HeatOverlayProps {
  level: HeatLevel;
}

/**
 * Kleurt een zone naar de gemiddelde risicoscore van de bewoners.
 */
export function HeatOverlay({ level }: HeatOverlayProps) {
  return <div className={`${styles.overlay} ${HEAT_CLASS[level]}`} />;
}
