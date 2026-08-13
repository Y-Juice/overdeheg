import express from "express";

/**
 * Entrypoint van de Overdeheg backend.
 * Start een Express server met een health-endpoint,
 * zodat de scaffold via docker compose te controleren is.
 */
const app = express();
app.use(express.json());

const port = Number(process.env.PORT ?? 4000);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(port, () => {
  console.log(`Overdeheg backend luistert op poort ${port}`);
});
