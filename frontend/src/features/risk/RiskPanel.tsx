import { displayUsername } from "../chat/chatUtils";
import { flagLabel } from "../map/mapUtils";
import { useAppStore } from "../../stores/appStore";
import {
  barWidth,
  flagTone,
  formatRiskPercent,
  riskTone,
  signalLabel,
  trendLabel
} from "./riskUtils";
import styles from "./RiskPanel.module.css";

/**
 * Visualisatiepaneel met risico per bewoner, per zone,
 * correlatiesignalen, vlaggen en predictieve politie.
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
  const predictions = overview.predictions ?? {
    hotZoneCount: 0,
    watchCount: 0,
    zones: [],
    patrols: [],
    watchlist: [],
    incidents: []
  };
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
          Live scores plus voorspelde patrouilles, watchlist en incidenten
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
        <div className={styles.kpi}>
          <span className={styles.kpiLabel}>Patrouilles</span>
          <span className={`${styles.kpiValue} ${styles.kpiWarn}`}>
            {predictions.hotZoneCount}
          </span>
        </div>
        <div className={styles.kpi}>
          <span className={styles.kpiLabel}>Watchlist</span>
          <span className={`${styles.kpiValue} ${styles.kpiDanger}`}>
            {predictions.watchCount}
          </span>
        </div>
      </div>

      <div className={styles.predictGrid}>
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Patrouilleadvies</h3>
          <div className={styles.list}>
            {predictions.patrols.length === 0 ? (
              <p className={styles.empty}>Geen zone vraagt nu om extra inzet</p>
            ) : (
              predictions.patrols.map((patrol) => (
                <div key={patrol.zoneId} className={styles.row}>
                  <div>
                    <div className={styles.label}>{patrol.zoneName}</div>
                    <div className={styles.meta}>{patrol.action}</div>
                  </div>
                  <div className={styles.track}>
                    <div
                      className={`${styles.fill} ${styles[riskTone(patrol.predictedRisk)]}`}
                      style={{ width: barWidth(patrol.predictedRisk) }}
                    />
                  </div>
                  <span className={styles.value}>
                    {formatRiskPercent(patrol.predictedRisk)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Watchlist</h3>
          <div className={styles.list}>
            {predictions.watchlist.length === 0 ? (
              <p className={styles.empty}>Niemand nabij escalatie</p>
            ) : (
              predictions.watchlist.map((item) => (
                <div key={item.uid} className={styles.row}>
                  <div>
                    <div className={styles.label}>{displayUsername(item.uid)}</div>
                    <div className={styles.meta}>
                      {item.zoneName} · {item.reason}
                    </div>
                  </div>
                  <div className={styles.track}>
                    <div
                      className={`${styles.fill} ${styles[flagTone(item.flagLevel)]}`}
                      style={{ width: barWidth(item.escalateChance) }}
                    />
                  </div>
                  <span className={styles.value}>
                    {formatRiskPercent(item.escalateChance)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Verwachte incidenten</h3>
          <div className={styles.list}>
            {predictions.incidents.map((incident) => (
              <div key={incident.title} className={styles.row}>
                <div>
                  <div className={styles.label}>{incident.title}</div>
                  <div className={styles.meta}>
                    {incident.zoneName} · {incident.detail}
                  </div>
                </div>
                <div className={styles.track}>
                  <div
                    className={`${styles.fill} ${styles[riskTone(incident.likelihood)]}`}
                    style={{ width: barWidth(incident.likelihood) }}
                  />
                </div>
                <span className={styles.value}>
                  {formatRiskPercent(incident.likelihood)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Risico per omgeving</h3>
          <div className={styles.list}>
            {zones.length === 0 ? (
              <p className={styles.empty}>Nog geen zone-data</p>
            ) : (
              zones.map((zone) => {
                const forecast = predictions.zones.find(
                  (item) => item.zoneId === zone.zoneId
                );
                return (
                <div key={zone.zoneId} className={styles.row}>
                  <div>
                    <div className={styles.label}>{zone.zoneName}</div>
                    <div className={styles.meta}>
                      {zone.residentCount} bewoners · {zone.flaggedCount} gemarkeerd
                      {forecast
                        ? ` · voorspeld ${formatRiskPercent(forecast.predictedRisk)} (${trendLabel(forecast.trend)})`
                        : ""}
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
                );
              })
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
