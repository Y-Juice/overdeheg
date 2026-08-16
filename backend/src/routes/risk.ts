import { Router } from "express";
import { RiskOverviewService } from "../services/RiskOverviewService";

/**
 * Maakt de router voor /api/risk.
 * Geeft geaggregeerde risicodata terug voor het visualisatiepaneel.
 */
export function createRiskRouter(riskOverviewService: RiskOverviewService): Router {
  const router = Router();

  router.get("/overview", async (_req, res) => {
    try {
      const overview = await riskOverviewService.getOverview();
      res.json(overview);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Interne serverfout" });
    }
  });

  return router;
}
