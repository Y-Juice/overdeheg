import { ResidentView } from "../../types";
import { flagLabel, positionIndex } from "./mapUtils";
import styles from "./ResidentShape.module.css";

const LEVEL_CLASS = {
  laag: styles.laag,
  verhoogd: styles.verhoogd,
  kritiek: styles.kritiek
};

const SLOT_CLASS = [
  styles.slot0,
  styles.slot1,
  styles.slot2,
  styles.slot3,
  styles.slot4,
  styles.slot5,
  styles.slot6,
  styles.slot7,
  styles.slot8
];

interface ResidentShapeProps {
  resident: ResidentView;
  isOwn: boolean;
}

/**
 * Tekent een bewoner als een vorm waarvan kleur en silhouet
 * het dreigingsniveau laten zien.
 */
export function ResidentShape({ resident, isOwn }: ResidentShapeProps) {
  const slot = SLOT_CLASS[positionIndex(resident.uid)];
  const ownClass = isOwn ? styles.own : "";
  const label = isOwn
    ? `Jij, dreiging ${flagLabel(resident.flagLevel)}`
    : `Bewoner, dreiging ${flagLabel(resident.flagLevel)}`;

  return (
    <span
      className={`${styles.shape} ${LEVEL_CLASS[resident.flagLevel]} ${slot} ${ownClass}`}
      title={label}
      aria-label={label}
    />
  );
}
