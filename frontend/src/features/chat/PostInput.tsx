import { FormEvent, useRef, useState } from "react";
import { PostBehaviour } from "../../types/chat";
import { SuggestedPrompts } from "./SuggestedPrompts";
import styles from "./PostInput.module.css";

const MAX_LENGTH = 500;

interface PostInputProps {
  disabled: boolean;
  prompts: string[];
  onSubmit: (content: string, behaviour: PostBehaviour) => Promise<void>;
}

/**
 * Invoerveld voor een nieuw buurtbericht.
 * Meet stil de aarzeltijd en het aantal bewerkingen,
 * en biedt snelle startvragen voor vertakte gesprekken.
 */
export function PostInput({ disabled, prompts, onSubmit }: PostInputProps) {
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

  const send = async (
    text: string,
    hesitationMs: number,
    edits: number
  ): Promise<void> => {
    const clean = text.replace(/\s+/g, " ").trim();
    if (clean.length === 0 || sending || disabled) {
      return;
    }
    setSending(true);
    try {
      await onSubmit(clean, { hesitationMs, editCount: edits });
      setContent("");
      resetBehaviour();
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    const started = focusStartedAt.current ?? Date.now();
    const hesitationMs = Math.max(0, Date.now() - started);
    await send(content, hesitationMs, editCount.current);
  };

  const handlePromptSelect = async (prompt: string): Promise<void> => {
    await send(prompt, 500, 0);
  };

  return (
    <form className={styles.form} onSubmit={(event) => void handleSubmit(event)}>
      <SuggestedPrompts
        prompts={prompts}
        disabled={disabled || sending}
        onSelect={(prompt) => {
          void handlePromptSelect(prompt);
        }}
      />
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
