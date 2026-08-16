import { ChatFeed } from "./features/chat/ChatFeed";
import { ZoneMap } from "./features/map/ZoneMap";
import { useOverdehegData } from "./hooks/useOverdehegData";
import { useAppStore } from "./stores/appStore";
import styles from "./App.module.css";

/**
 * Hoofdcomponent van Overdeheg.
 * Laadt data via hooks en toont de wijkkaart en de buurtchat.
 */
function App() {
  const { postMessage, removeMessage } = useOverdehegData();
  const session = useAppStore((state) => state.session);
  const error = useAppStore((state) => state.error);

  return (
    <main>
      <h1>Overdeheg</h1>
      <p className={styles.status}>
        Actieve zone: {session.zoneName ?? "wordt bepaald"}
      </p>
      {error ? <p className={styles.error}>{error}</p> : null}
      <ZoneMap />
      <ChatFeed postMessage={postMessage} removeMessage={removeMessage} />
    </main>
  );
}

export default App;
