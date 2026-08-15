import { Router } from "express";
import { ZoneService } from "../services/ZoneService";

/**
 * Maakt de router voor /api/zones.
 * De route doet alleen HTTP-werk, alle logica zit in ZoneService.
 */
export function createZonesRouter(zoneService: ZoneService): Router {
  const router = Router();

  router.get("/", async (_req, res) => {
    try {
      const zones = await zoneService.listZones();
      res.json(zones);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Interne serverfout" });
    }
  });

  return router;
}
