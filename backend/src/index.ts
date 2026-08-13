import express from "express";
import { checkDatabaseConnection, pool } from "./db/client";
import { createMessagesRouter } from "./routes/messages";
import { MessageService } from "./services/MessageService";
import { NLPService } from "./services/NLPService";
import { SystemLogService } from "./services/SystemLogService";
import { MessageValidator } from "./services/validation/MessageValidator";

/**
 * Entrypoint van de Overdeheg backend.
 * Bouwt hier alle services op met hun afhankelijkheden (composition root)
 * en koppelt ze aan de Express routes.
 */
const app = express();
app.use(express.json());

const port = Number(process.env.PORT ?? 4000);

const systemLogService = new SystemLogService(pool);
const messageService = new MessageService(
  pool,
  new MessageValidator(),
  new NLPService(),
  systemLogService
);

app.use("/api/messages", createMessagesRouter(messageService));

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
