import { FormattedLogLine } from "../../types/systemLog";
import styles from "./LogLine.module.css";

const LEVEL_CLASS = {
  info: styles.info,
  waarschuwing: styles.waarschuwing,
  alarm: styles.alarm
};

interface LogLineProps {
  line: FormattedLogLine;
}

/**
 * Eén regel in het terminalpaneel van het systeemlog.
 */
export function LogLine({ line }: LogLineProps) {
  return (
    <div className={styles.line}>
      <span className={styles.time}>{line.timestamp}</span>
      <span className={`${styles.level} ${LEVEL_CLASS[line.level]}`}>
        [{line.levelLabel}]
      </span>
      <span className={styles.message}>{line.message}</span>
    </div>
  );
}
