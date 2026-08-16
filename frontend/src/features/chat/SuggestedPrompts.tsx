import styles from "./SuggestedPrompts.module.css";

interface SuggestedPromptsProps {
  prompts: string[];
  disabled: boolean;
  onSelect: (prompt: string) => void;
}

/**
 * Toont snelle startvragen die een vertakt buurtgesprek kunnen beginnen.
 */
export function SuggestedPrompts({
  prompts,
  disabled,
  onSelect
}: SuggestedPromptsProps) {
  if (prompts.length === 0) {
    return null;
  }

  return (
    <div className={styles.wrap}>
      <p className={styles.label}>Kies een vraag om het gesprek te starten:</p>
      <div className={styles.list}>
        {prompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            className={styles.option}
            disabled={disabled}
            onClick={() => onSelect(prompt)}
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}
