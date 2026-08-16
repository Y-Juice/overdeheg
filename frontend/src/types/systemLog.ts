import { LogLevel } from "./index";

/** Weergavevorm van één regel in het terminalpaneel. */
export interface FormattedLogLine {
  id: number;
  level: LogLevel;
  levelLabel: string;
  timestamp: string;
  message: string;
}
