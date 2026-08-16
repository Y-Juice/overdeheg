import { useCallback, useEffect, useState } from "react";
import { fetchDialoguePrompts } from "../utils/api";

/**
 * Laadt de startvragen voor vertakte gesprekken uit de API.
 */
export function useDialoguePrompts(): string[] {
  const [prompts, setPrompts] = useState<string[]>([]);

  const load = useCallback(async () => {
    try {
      const list = await fetchDialoguePrompts();
      setPrompts(list);
    } catch {
      setPrompts([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return prompts;
}
