import { Message } from "../../types";
import { MessageItem } from "./MessageItem";
import styles from "./MessageList.module.css";

interface MessageListProps {
  messages: Message[];
  ownUid: string;
  onDelete: (messageId: number) => void;
}

/**
 * Toont de berichtenlijst van de actieve zone.
 */
export function MessageList({ messages, ownUid, onDelete }: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div className={styles.list}>
        <p className={styles.empty}>Nog geen berichten in deze zone.</p>
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {messages.map((message) => (
        <MessageItem
          key={message.id}
          message={message}
          isOwn={message.uid === ownUid}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
