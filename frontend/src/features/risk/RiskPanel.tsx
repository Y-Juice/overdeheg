import { displayUsername } from "../chat/chatUtils";
import { flagLabel } from "../map/mapUtils";
import { useAppStore } from "../../stores/appStore";
import {
  barWidth,
  flagTone,
  formatRiskPercent,
  riskTone,
  signalLabel
} from "./riskUtils";
import styles from "./RiskPanel.module.css";

/**
 * Visualisatiepaneel met risico per bewoner, per zone,
 * correlatiesignalen en vlagverdeling.
 */
export function RiskPanel() {
  const overview = useAppStore((state) => state.riskOverview);

  if (!overview) {
    return (
      <section className={styles.wrap}>
        <h2 className={styles.title}>Risicoanalyse</h2>
        <p className={styles.loading}>Data wordt geladen...</p>
      </section>
    );
  }

  const { totals, zones, residents, signals, flags } = overview;
  const maxSignalWeight = Math.max(
    1,
    ...signals.map((signal) => signal.totalWeight)
  );
  const maxFlagCount = Math.max(1, ...flags.map((flag) => flag.count));

  return (
    <section className={styles.wrap}>
      <div>
        <h2 className={styles.title}>Risicoanalyse</h2>
        <p className={styles.subtitle}>
          Live aggregatie uit scores, zones, correlaties en vlaggen
        </p>
      </div>

      <div className={styles.kpis}>
        <div className={styles.kpi}>
          <span className={styles.kpiLabel}>Bewoners</span>
          <span className={styles.kpiValue}>{totals.residentCount}</span>
        </div>
        <div className={styles.kpi}>
          <span className={styles.kpiLabel}>Gem. risico</span>
          <span className={styles.kpiValue}>
            {formatRiskPercent(totals.averageRisk)}
          </span>
        </div>
        <div className={styles.kpi}>
          <span className={styles.kpiLabel}>Gemarkeerd</span>
          <span className={`${styles.kpiValue} ${styles.kpiWarn}`}>
            {totals.flaggedCount}
          </span>
        </div>
        <div className={styles.kpi}>
          <span className={styles.kpiLabel}>Kritiek</span>
          <span className={`${styles.kpiValue} ${styles.kpiDanger}`}>
            {totals.criticalCount}
          </span>
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Risico per omgeving</h3>
          <div className={styles.list}>
            {zones.length === 0 ? (
              <p className={styles.empty}>Nog geen zone-data</p>
            ) : (
              zones.map((zone) => (
                <div key={zone.zoneId} className={styles.row}>
                  <div>
                    <div className={styles.label}>{zone.zoneName}</div>
                    <div className={styles.meta}>
                      {zone.residentCount} bewoners · {zone.flaggedCount} gemarkeerd
                    </div>
                  </div>
                  <div className={styles.track}>
                    <div
                      className={`${styles.fill} ${styles[riskTone(zone.averageRisk)]}`}
                      style={{ width: barWidth(zone.averageRisk) }}
                    />
                  </div>
                  <span className={styles.value}>
                    {formatRiskPercent(zone.averageRisk)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Risico per bewoner</h3>
          <div className={styles.list}>
            {residents.length === 0 ? (
              <p className={styles.empty}>Nog geen bewoners</p>
            ) : (
              residents.map((resident) => (
                <div key={resident.uid} className={styles.row}>
                  <div>
                    <div className={styles.label}>
                      {displayUsername(resident.uid)}
                    </div>
                    <div className={styles.meta}>
                      {resident.zoneName} · {flagLabel(resident.flagLevel)}
                    </div>
                  </div>
                  <div className={styles.track}>
                    <div
                      className={`${styles.fill} ${styles[flagTone(resident.flagLevel)]}`}
                      style={{ width: barWidth(resident.riskScore) }}
                    />
                  </div>
                  <span className={styles.value}>
                    {formatRiskPercent(resident.riskScore)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Correlatiesignalen</h3>
          <div className={styles.list}>
            {signals.length === 0 ? (
              <p className={styles.empty}>Nog geen correlaties</p>
            ) : (
              signals.map((signal) => (
                <div key={signal.matchType} className={styles.row}>
                  <div>
                    <div className={styles.label}>
                      {signalLabel(signal.matchType)}
                    </div>
                    <div className={styles.meta}>{signal.count} treffers</div>
                  </div>
                  <div className={styles.track}>
                    <div
                      className={`${styles.fill} ${styles.raised}`}
                      style={{
                        width: barWidth(signal.totalWeight / maxSignalWeight)
                      }}
                    />
                  </div>
                  <span className={styles.value}>
                    {signal.totalWeight.toFixed(1)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Vlaggen & activiteit</h3>
          <div className={styles.list}>
            {flags.map((flag) => (
              <div key={flag.level} className={styles.row}>
                <div>
                  <div className={styles.label}>{flagLabel(flag.level)}</div>
                  <div className={styles.meta}>huidig niveau</div>
                </div>
                <div className={styles.track}>
                  <div
                    className={`${styles.fill} ${styles[flagTone(flag.level)]}`}
                    style={{ width: barWidth(flag.count / maxFlagCount) }}
                  />
                </div>
                <span className={styles.value}>{flag.count}</span>
              </div>
            ))}
            <div className={styles.row}>
              <div>
                <div className={styles.label}>Berichten</div>
                <div className={styles.meta}>totaal in database</div>
              </div>
              <div className={styles.track}>
                <div
                  className={`${styles.fill} ${styles.low}`}
                  style={{ width: "100%" }}
                />
              </div>
              <span className={styles.value}>{totals.messageCount}</span>
            </div>
            <div className={styles.row}>
              <div>
                <div className={styles.label}>Locatiepings</div>
                <div className={styles.meta}>bewegingsdata</div>
              </div>
              <div className={styles.track}>
                <div
                  className={`${styles.fill} ${styles.low}`}
                  style={{ width: "100%" }}
                />
              </div>
              <span className={styles.value}>{totals.pingCount}</span>
            </div>
            <div className={styles.row}>
              <div>
                <div className={styles.label}>Correlaties</div>
                <div className={styles.meta}>actieve matches</div>
              </div>
              <div className={styles.track}>
                <div
                  className={`${styles.fill} ${styles.raised}`}
                  style={{ width: "100%" }}
                />
              </div>
              <span className={styles.value}>{totals.correlationCount}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
