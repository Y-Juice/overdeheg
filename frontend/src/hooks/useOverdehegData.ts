import { useMessages } from "./useMessages";
import { useResidents } from "./useResidents";
import { useSession } from "./useSession";
import { useSystemLog } from "./useSystemLog";
import { useZones } from "./useZones";

/**
 * Start alle datahooks van Overdeheg.
 * Componenten hoeven alleen deze hook aan te roepen
 * om sessie, zones, berichten, bewoners en het log te vullen.
 */
export function useOverdehegData(): {
  postMessage: (content: string, hesitationMs: number, editCount: number) => Promise<void>;
  removeMessage: (messageId: number) => Promise<void>;
} {
  useSession();
  useZones();
  const actions = useMessages();
  useResidents();
  useSystemLog();
  return actions;
}
