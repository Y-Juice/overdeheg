import { Router } from "express";
import { DialogueService } from "../services/DialogueService";

/**
 * Maakt de router voor /api/dialogue.
 * Geeft alleen de startvragen terug; de vertakkingen draaien server-side.
 */
export function createDialogueRouter(dialogueService: DialogueService): Router {
  const router = Router();

  router.get("/prompts", (_req, res) => {
    res.json({ prompts: dialogueService.listPrompts() });
  });

  return router;
}
