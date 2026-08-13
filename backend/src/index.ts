import express from "express";
import { checkDatabaseConnection, pool } from "./db/client";
import { CorrelationEngine } from "./engine/CorrelationEngine";
import { DeletionMatcher } from "./engine/matchers/DeletionMatcher";
import { EditPatternMatcher } from "./engine/matchers/EditPatternMatcher";
import { HesitationMatcher } from "./engine/matchers/HesitationMatcher";
import { KeywordMatcher } from "./engine/matchers/KeywordMatcher";
import { MovementMatcher } from "./engine/matchers/MovementMatcher";
import { createMessagesRouter } from "./routes/messages";
import { createPingsRouter } from "./routes/pings";
import { LocationService } from "./services/LocationService";
import { MessageService } from "./services/MessageService";
import { NLPService } from "./services/NLPService";
import { SystemLogService } from "./services/SystemLogService";
import { MessageValidator } from "./services/validation/MessageValidator";
import { PingValidator } from "./services/validation/PingValidator";
import { ZoneService } from "./services/ZoneService";

/**
 * Entrypoint van de Overdeheg backend.
 * Bouwt hier alle services op met hun afhankelijkheden (composition root)
 * en koppelt ze aan de Express routes.
 */
const app = express();
app.use(express.json());

const port = Number(process.env.PORT ?? 4000);

const CORRELATION_INTERVAL_MS = 60_000;

const systemLogService = new SystemLogService(pool);
const nlpService = new NLPService();
const messageService = new MessageService(
  pool,
  new MessageValidator(),
  nlpService,
  systemLogService
);

const locationService = new LocationService(
  pool,
  new PingValidator(),
  new ZoneService(pool),
  systemLogService
);

const correlationEngine = new CorrelationEngine(
  pool,
  [
    new HesitationMatcher(pool),
    new EditPatternMatcher(pool),
    new DeletionMatcher(pool),
    new MovementMatcher(pool),
    new KeywordMatcher(pool, nlpService)
  ],
  systemLogService
);
correlationEngine.start(CORRELATION_INTERVAL_MS);

app.use("/api/messages", createMessagesRouter(messageService));
app.use("/api/pings", createPingsRouter(locationService));

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
