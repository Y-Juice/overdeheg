import { useAppStore } from "../../stores/appStore";
import { Message } from "../../types";
import { PostBehaviour } from "../../types/chat";

/**
 * Levert de chatstaat en acties voor de actieve zone.
 * Componenten lezen alleen deze waarden en sturen plaatsen/verwijderen hiernaartoe.
 */
export function useChatFeed(actions: {
  postMessage: (content: string, hesitationMs: number, editCount: number) => Promise<void>;
  removeMessage: (messageId: number) => Promise<void>;
}): {
  messages: Message[];
  ownUid: string;
  zoneName: string | null;
  zoneReady: boolean;
  canPost: boolean;
  submitMessage: (content: string, behaviour: PostBehaviour) => Promise<void>;
  deleteOwnMessage: (messageId: number) => Promise<void>;
} {
  const messages = useAppStore((state) => state.messages);
  const ownUid = useAppStore((state) => state.session.uid);
  const zoneName = useAppStore((state) => state.session.zoneName);
  const zoneId = useAppStore((state) => state.session.zoneId);
  const homeZoneId = useAppStore((state) => state.session.homeZoneId);

  return {
    messages,
    ownUid,
    zoneName,
    zoneReady: zoneId !== null,
    canPost: zoneId !== null && zoneId === homeZoneId,
    submitMessage: async (content, behaviour) => {
      await actions.postMessage(content, behaviour.hesitationMs, behaviour.editCount);
    },
    deleteOwnMessage: async (messageId) => {
      await actions.removeMessage(messageId);
    }
  };
}
