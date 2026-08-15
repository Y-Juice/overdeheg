import { ResidentView, Zone } from "../../types";
import { ZoneSummary } from "../../types/map";
import { HeatOverlay } from "./HeatOverlay";
import { ResidentShape } from "./ResidentShape";
import { ZoneTooltip } from "./ZoneTooltip";
import styles from "./ZoneCell.module.css";

const COL_CLASS = [styles.col0, styles.col1, styles.col2];
const ROW_CLASS = [styles.row0, styles.row1];

interface ZoneCellProps {
  zone: Zone;
  summary: ZoneSummary;
  residents: ResidentView[];
  ownUid: string;
  isOwn: boolean;
  isSelected: boolean;
  isHovered: boolean;
  onHover: (zoneId: number | null) => void;
  onSelect: (zoneId: number, zoneName: string) => void;
}

/**
 * Een vak op de wijkkaart: heat, bewonersvormen en tooltip.
 */
export function ZoneCell({
  zone,
  summary,
  residents,
  ownUid,
  isOwn,
  isSelected,
  isHovered,
  onHover,
  onSelect
}: ZoneCellProps) {
  const className = [
    styles.cell,
    COL_CLASS[zone.gridX],
    ROW_CLASS[zone.gridY],
    isSelected ? styles.selected : "",
    isOwn ? styles.own : "",
    isHovered ? styles.hovered : ""
  ].join(" ");

  return (
    <button
      type="button"
      className={className}
      onMouseEnter={() => onHover(zone.id)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(zone.id)}
      onBlur={() => onHover(null)}
      onClick={() => onSelect(zone.id, zone.name)}
    >
      <HeatOverlay level={summary.heatLevel} />
      <span className={styles.name}>{zone.name}</span>
      {isOwn ? <span className={styles.ownLabel}>jouw zone</span> : null}
      <div className={styles.residents}>
        {residents.map((resident) => (
          <ResidentShape
            key={resident.uid}
            resident={resident}
            isOwn={resident.uid === ownUid}
          />
        ))}
      </div>
      <ZoneTooltip summary={summary} visible={isHovered} />
    </button>
  );
}
