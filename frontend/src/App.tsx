import { useOverdehegData } from "./hooks/useOverdehegData";
import { useAppStore } from "./stores/appStore";
import styles from "./App.module.css";

/**
 * Hoofdcomponent van Overdeheg.
 * Laadt de echte data via hooks en toont een korte status
 * tot de kaart, chat en het systeemlog hun eigen schermen krijgen.
 */
function App() {
  useOverdehegData();
  const session = useAppStore((state) => state.session);
  const zones = useAppStore((state) => state.zones);
  const messages = useAppStore((state) => state.messages);
  const residents = useAppStore((state) => state.residents);
  const systemLog = useAppStore((state) => state.systemLog);
  const error = useAppStore((state) => state.error);

  return (
    <main>
      <h1>Overdeheg</h1>
      <p>De buurtchat wordt opgebouwd...</p>
      <p className={styles.status}>
        Zone: {session.zoneName ?? "wordt bepaald"} · Zones: {zones.length} ·
        Berichten: {messages.length} · Bewoners: {residents.length} ·
        Logregels: {systemLog.length}
      </p>
      {error ? <p className={styles.error}>{error}</p> : null}
    </main>
  );
}

export default App;
