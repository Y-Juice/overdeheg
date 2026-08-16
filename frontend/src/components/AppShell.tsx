import { ReactNode } from "react";
import styles from "./AppShell.module.css";

interface AppShellProps {
  zoneName: string | null;
  error: string | null;
  map: ReactNode;
  chat: ReactNode;
  systemLog: ReactNode;
  risk: ReactNode;
}

/**
 * App-shell van Overdeheg: header plus vier panelen
 * in de lichte growth-stijl met diepgroene accenten.
 */
export function AppShell({
  zoneName,
  error,
  map,
  chat,
  systemLog,
  risk
}: AppShellProps) {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <h1 className={styles.title}>Overdeheg</h1>
          <p className={styles.tagline}>Anonieme buurtchat · stille observatie</p>
        </div>
        <div className={styles.meta}>
          <p className={styles.status}>
            Actieve zone: {zoneName ?? "wordt bepaald"}
          </p>
          {error ? <p className={styles.error}>{error}</p> : null}
        </div>
      </header>
      <div className={styles.panels}>
        <section className={`${styles.panel} ${styles.mapPanel}`}>{map}</section>
        <section className={`${styles.panel} ${styles.chatPanel}`}>{chat}</section>
        <section className={`${styles.panel} ${styles.logPanel}`}>{systemLog}</section>
        <section className={`${styles.panel} ${styles.riskPanel}`}>{risk}</section>
      </div>
    </div>
  );
}
