import { Router } from "express";
import { MessageService } from "../services/MessageService";
import { ValidationError } from "../services/validation/ValidationError";

/**
 * Maakt de router voor /api/messages.
 * De route doet alleen HTTP-werk, alle logica zit in MessageService.
 */
export function createMessagesRouter(messageService: MessageService): Router {
  const router = Router();

  router.post("/", async (req, res) => {
    try {
      const message = await messageService.createMessage(req.body);
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.message });
        return;
      }
      console.error(error);
      res.status(500).json({ error: "Interne serverfout" });
    }
  });

  return router;
}
