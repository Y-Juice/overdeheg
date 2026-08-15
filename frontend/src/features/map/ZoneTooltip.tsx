import { ZoneSummary } from "../../types/map";
import { flagLabel } from "./mapUtils";
import styles from "./ZoneTooltip.module.css";

interface ZoneTooltipProps {
  summary: ZoneSummary;
  visible: boolean;
}

/**
 * Toont de actuele dreigingscijfers van een zone bij hover.
 */
export function ZoneTooltip({ summary, visible }: ZoneTooltipProps) {
  const riskText = summary.averageRisk.toFixed(2);
  const countText =
    summary.residentCount === 1
      ? "1 bewoner"
      : `${summary.residentCount} bewoners`;

  return (
    <div className={`${styles.tooltip} ${visible ? "" : styles.hidden}`}>
      <div className={styles.name}>{summary.zoneName}</div>
      <div>
        {countText} · risico {riskText} · vlag {flagLabel(summary.highestFlag)}
      </div>
    </div>
  );
}
