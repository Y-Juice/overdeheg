import { useAppStore } from "../../stores/appStore";
import { ZoneCell } from "./ZoneCell";
import { useZoneMap } from "./useZoneMap";
import styles from "./ZoneMap.module.css";

/**
 * CSS-kaart van de wijk: zes zones, heat overlay en bewonersvormen.
 * Klikken op een zone wisselt de actieve zone in de store,
 * zodat chat en status meebewegen.
 */
export function ZoneMap() {
  const ownUid = useAppStore((state) => state.session.uid);
  const {
    zones,
    residents,
    summaries,
    selectedZoneId,
    ownZoneId,
    hoveredZoneId,
    setHoveredZoneId,
    selectZone
  } = useZoneMap();

  if (zones.length === 0) {
    return <p className={styles.empty}>Kaart wordt geladen...</p>;
  }

  return (
    <section className={styles.wrap}>
      <h2 className={styles.title}>Wijkoverzicht</h2>
      <div className={styles.grid}>
        {zones.map((zone) => {
          const summary = summaries.find((item) => item.zoneId === zone.id);
          if (!summary) {
            return null;
          }
          const inZone = residents.filter((resident) => resident.zoneId === zone.id);
          return (
            <ZoneCell
              key={zone.id}
              zone={zone}
              summary={summary}
              residents={inZone}
              ownUid={ownUid}
              isOwn={ownZoneId === zone.id}
              isSelected={selectedZoneId === zone.id}
              isHovered={hoveredZoneId === zone.id}
              onHover={setHoveredZoneId}
              onSelect={selectZone}
            />
          );
        })}
      </div>
    </section>
  );
}
