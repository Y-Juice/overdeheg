import { useDialoguePrompts } from "../../hooks/useDialoguePrompts";
import { PostBehaviour } from "../../types/chat";
import { MessageList } from "./MessageList";
import { PostInput } from "./PostInput";
import { useChatFeed } from "./useChatFeed";
import styles from "./ChatFeed.module.css";

interface ChatFeedProps {
  postMessage: (content: string, hesitationMs: number, editCount: number) => Promise<void>;
  removeMessage: (messageId: number) => Promise<void>;
}

/**
 * Chatfeed van de actieve zone: berichtenlijst, soft delete,
 * snelle startvragen en vertakte buurtgesprekken.
 */
export function ChatFeed({ postMessage, removeMessage }: ChatFeedProps) {
  const prompts = useDialoguePrompts();
  const {
    messages,
    ownUid,
    zoneName,
    zoneReady,
    canPost,
    submitMessage,
    deleteOwnMessage
  } = useChatFeed({ postMessage, removeMessage });

  const handleSubmit = async (
    content: string,
    behaviour: PostBehaviour
  ): Promise<void> => {
    await submitMessage(content, behaviour);
  };

  if (!zoneReady) {
    return (
      <section className={styles.wrap}>
        <h2 className={styles.title}>Buurtchat</h2>
        <p className={styles.waiting}>Zone wordt bepaald...</p>
      </section>
    );
  }

  return (
    <section className={styles.wrap}>
      <h2 className={styles.title}>Buurtchat</h2>
      <p className={styles.subtitle}>
        Berichten in {zoneName ?? "onbekende zone"}
      </p>
      <MessageList
        messages={messages}
        ownUid={ownUid}
        onDelete={(messageId) => {
          void deleteOwnMessage(messageId);
        }}
      />
      {canPost ? (
        <PostInput
          disabled={!zoneReady}
          prompts={prompts}
          onSubmit={handleSubmit}
        />
      ) : (
        <p className={styles.waiting}>
          Je kunt alleen berichten plaatsen in je eigen zone.
        </p>
      )}
    </section>
  );
}
