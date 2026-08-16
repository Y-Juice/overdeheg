import { useEffect, useRef } from "react";
import { LogLine } from "./LogLine";
import { useSystemLogPanel } from "./useSystemLogPanel";
import styles from "./SystemLogPanel.module.css";

/**
 * Terminalpaneel met live systeemlog uit de database.
 * Nieuwe regels verschijnen onderaan en scrollen automatisch mee.
 */
export function SystemLogPanel() {
  const { lines, isEmpty } = useSystemLogPanel();
  const terminalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = terminalRef.current;
    if (node) {
      node.scrollTop = node.scrollHeight;
    }
  }, [lines]);

  return (
    <section className={styles.wrap}>
      <h2 className={styles.title}>Systeemlog</h2>
      <p className={styles.subtitle}>Observaties van wijk Overdeheg</p>
      <div className={styles.terminal} ref={terminalRef}>
        {isEmpty ? (
          <p className={styles.empty}>Wachten op observaties...</p>
        ) : (
          lines.map((line) => <LogLine key={line.id} line={line} />)
        )}
      </div>
    </section>
  );
}
