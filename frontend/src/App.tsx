import { AppShell } from "./components/AppShell";
import { ChatFeed } from "./features/chat/ChatFeed";
import { ZoneMap } from "./features/map/ZoneMap";
import { RiskPanel } from "./features/risk/RiskPanel";
import { SystemLogPanel } from "./features/systemlog/SystemLogPanel";
import { useOverdehegData } from "./hooks/useOverdehegData";
import { useAppStore } from "./stores/appStore";

/**
 * Hoofdcomponent van Overdeheg.
 * Laadt data via hooks en zet alles in de app-shell.
 */
function App() {
  const { postMessage, removeMessage } = useOverdehegData();
  const session = useAppStore((state) => state.session);
  const error = useAppStore((state) => state.error);

  return (
    <AppShell
      zoneName={session.zoneName}
      error={error}
      map={<ZoneMap />}
      chat={<ChatFeed postMessage={postMessage} removeMessage={removeMessage} />}
      systemLog={<SystemLogPanel />}
      risk={<RiskPanel />}
    />
  );
}

export default App;
