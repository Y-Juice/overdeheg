import express from "express";
import { checkDatabaseConnection } from "./db/client";

/**
 * Entrypoint van de Overdeheg backend.
 * Start een Express server met een health-endpoint
 * dat ook de databaseverbinding controleert.
 */
const app = express();
app.use(express.json());

const port = Number(process.env.PORT ?? 4000);

app.get("/api/health", async (_req, res) => {
  const databaseOk = await checkDatabaseConnection();
  res.json({
    status: "ok",
    database: databaseOk ? "verbonden" : "niet verbonden"
  });
});

app.listen(port, () => {
  console.log(`Overdeheg backend luistert op poort ${port}`);
});
