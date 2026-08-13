import { Router } from "express";
import { ResidentService } from "../services/ResidentService";

/**
 * Maakt de router voor /api/residents.
 * De route doet alleen HTTP-werk, alle logica zit in ResidentService.
 */
export function createResidentsRouter(residentService: ResidentService): Router {
  const router = Router();

  router.get("/:zoneId", async (req, res) => {
    const zoneId = Number(req.params.zoneId);
    if (!Number.isInteger(zoneId) || zoneId <= 0) {
      res.status(400).json({ error: "zoneId moet een positief geheel getal zijn" });
      return;
    }

    try {
      const residents = await residentService.getResidentsByZone(zoneId);
      if (residents === null) {
        res.status(404).json({ error: "Zone niet gevonden" });
        return;
      }
      res.json(residents);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Interne serverfout" });
    }
  });

  return router;
}
