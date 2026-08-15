import { Router } from "express";
import { MessageService } from "../services/MessageService";
import { ValidationError } from "../services/validation/ValidationError";

/**
 * Maakt de router voor /api/messages.
 * De route doet alleen HTTP-werk, alle logica zit in MessageService.
 */
export function createMessagesRouter(messageService: MessageService): Router {
  const router = Router();

  router.get("/", async (req, res) => {
    const zoneId = Number(req.query.zoneId);
    if (!Number.isInteger(zoneId) || zoneId <= 0) {
      res.status(400).json({ error: "zoneId moet een positief geheel getal zijn" });
      return;
    }

    try {
      const messages = await messageService.getMessagesByZone(zoneId);
      if (messages === null) {
        res.status(404).json({ error: "Zone niet gevonden" });
        return;
      }
      res.json(messages);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Interne serverfout" });
    }
  });

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

  router.delete("/:id", async (req, res) => {
    const messageId = Number(req.params.id);
    if (!Number.isInteger(messageId) || messageId <= 0) {
      res.status(400).json({ error: "id moet een positief geheel getal zijn" });
      return;
    }

    try {
      const message = await messageService.softDelete(messageId);
      if (message === null) {
        res.status(404).json({ error: "Bericht niet gevonden" });
        return;
      }
      res.json(message);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Interne serverfout" });
    }
  });

  return router;
}
