import { Message } from "../../types";
import { formatMessageTime, shortUid } from "./chatUtils";
import styles from "./MessageItem.module.css";

interface MessageItemProps {
  message: Message;
  isOwn: boolean;
  onDelete: (messageId: number) => void;
}

/**
 * Toont één chatbericht, inclusief soft-deleted status
 * en een verwijderknop voor eigen berichten.
 */
export function MessageItem({ message, isOwn, onDelete }: MessageItemProps) {
  const authorLabel = isOwn ? "Jij" : `anoniem ${shortUid(message.uid)}`;

  return (
    <article className={styles.item}>
      <div className={styles.meta}>
        <span className={`${styles.author} ${isOwn ? styles.own : ""}`}>
          {authorLabel}
        </span>
        <time dateTime={message.createdAt}>
          {formatMessageTime(message.createdAt)}
        </time>
      </div>
      {message.isDeleted ? (
        <p className={`${styles.content} ${styles.deleted}`}>
          Dit bericht is verwijderd
        </p>
      ) : (
        <p className={styles.content}>{message.content}</p>
      )}
      {isOwn && !message.isDeleted ? (
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.deleteButton}
            onClick={() => onDelete(message.id)}
          >
            Verwijderen
          </button>
        </div>
      ) : null}
    </article>
  );
}
