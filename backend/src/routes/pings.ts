import { Router } from "express";
import { LocationService } from "../services/LocationService";
import { ValidationError } from "../services/validation/ValidationError";

/**
 * Maakt de router voor /api/pings.
 * De route doet alleen HTTP-werk, alle logica zit in LocationService.
 */
export function createPingsRouter(locationService: LocationService): Router {
  const router = Router();

  router.post("/", async (req, res) => {
    try {
      const ping = await locationService.createPing(req.body);
      res.status(201).json(ping);
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
