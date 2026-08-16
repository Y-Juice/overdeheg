import { useCallback, useEffect } from "react";
import { useAppStore } from "../stores/appStore";
import { createMessage, deleteMessage, fetchMessages } from "../utils/api";

const REFRESH_MS = 2000;

/**
 * Laadt de berichten van de actieve zone en biedt functies
 * om een bericht te plaatsen of te verwijderen.
 * Vernieuwt periodiek zodat vertraagde dialoogantwoorden zichtbaar worden.
 */
export function useMessages(): {
  postMessage: (content: string, hesitationMs: number, editCount: number) => Promise<void>;
  removeMessage: (messageId: number) => Promise<void>;
} {
  const session = useAppStore((state) => state.session);
  const setMessages = useAppStore((state) => state.setMessages);
  const setError = useAppStore((state) => state.setError);

  const load = useCallback(async () => {
    if (session.zoneId === null) {
      return;
    }
    try {
      const messages = await fetchMessages(session.zoneId);
      setMessages(messages);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Berichten laden mislukt");
    }
  }, [session.zoneId, setError, setMessages]);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => {
      void load();
    }, REFRESH_MS);
    return () => window.clearInterval(timer);
  }, [load]);

  const postMessage = useCallback(
    async (content: string, hesitationMs: number, editCount: number) => {
      try {
        await createMessage({
          uid: session.uid,
          content,
          latitude: session.latitude,
          longitude: session.longitude,
          hesitationMs,
          editCount
        });
        await load();
      } catch (error) {
        setError(error instanceof Error ? error.message : "Bericht plaatsen mislukt");
      }
    },
    [load, session, setError]
  );

  const removeMessage = useCallback(
    async (messageId: number) => {
      try {
        await deleteMessage(messageId);
        await load();
      } catch (error) {
        setError(error instanceof Error ? error.message : "Bericht verwijderen mislukt");
      }
    },
    [load, setError]
  );

  return { postMessage, removeMessage };
}
