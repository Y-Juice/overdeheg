import { FormEvent, useRef, useState } from "react";
import { PostBehaviour } from "../../types/chat";
import styles from "./PostInput.module.css";

const MAX_LENGTH = 500;

interface PostInputProps {
  disabled: boolean;
  onSubmit: (content: string, behaviour: PostBehaviour) => Promise<void>;
}

/**
 * Invoerveld voor een nieuw buurtbericht.
 * Meet stil de aarzeltijd en het aantal bewerkingen.
 */
export function PostInput({ disabled, onSubmit }: PostInputProps) {
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const focusStartedAt = useRef<number | null>(null);
  const editCount = useRef(0);
  const hasTyped = useRef(false);

  const handleFocus = (): void => {
    if (focusStartedAt.current === null) {
      focusStartedAt.current = Date.now();
    }
  };

  const handleChange = (value: string): void => {
    if (focusStartedAt.current === null) {
      focusStartedAt.current = Date.now();
    }
    if (hasTyped.current) {
      editCount.current += 1;
    } else if (value.trim().length > 0) {
      hasTyped.current = true;
    }
    setContent(value);
  };

  const resetBehaviour = (): void => {
    focusStartedAt.current = null;
    editCount.current = 0;
    hasTyped.current = false;
  };

  const handleSubmit = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    const clean = content.replace(/\s+/g, " ").trim();
    if (clean.length === 0 || sending || disabled) {
      return;
    }

    const started = focusStartedAt.current ?? Date.now();
    const hesitationMs = Math.max(0, Date.now() - started);
    setSending(true);
    try {
      await onSubmit(clean, {
        hesitationMs,
        editCount: editCount.current
      });
      setContent("");
      resetBehaviour();
    } finally {
      setSending(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={(event) => void handleSubmit(event)}>
      <textarea
        className={styles.input}
        value={content}
        onChange={(event) => handleChange(event.target.value)}
        onFocus={handleFocus}
        maxLength={MAX_LENGTH}
        placeholder="Schrijf anoniem in je zone..."
        disabled={disabled || sending}
        aria-label="Nieuw bericht"
      />
      <div className={styles.footer}>
        <span className={styles.hint}>
          {content.length}/{MAX_LENGTH}
        </span>
        <button
          type="submit"
          className={styles.submit}
          disabled={disabled || sending || content.trim().length === 0}
        >
          {sending ? "Plaatsen..." : "Plaatsen"}
        </button>
      </div>
    </form>
  );
}
