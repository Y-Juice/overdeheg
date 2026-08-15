import { Router } from "express";
import { SystemLogService } from "../services/SystemLogService";

const DEFAULT_LIMIT = 50;

/**
 * Maakt de router voor /api/system-log.
 * De route doet alleen HTTP-werk, alle logica zit in SystemLogService.
 */
export function createSystemLogRouter(systemLogService: SystemLogService): Router {
  const router = Router();

  router.get("/", async (req, res) => {
    const rawLimit = req.query.limit;
    const limit =
      rawLimit === undefined ? DEFAULT_LIMIT : Number(rawLimit);
    if (!Number.isInteger(limit) || limit <= 0) {
      res.status(400).json({ error: "limit moet een positief geheel getal zijn" });
      return;
    }

    try {
      const entries = await systemLogService.listRecent(limit);
      res.json(entries);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Interne serverfout" });
    }
  });

  return router;
}
