import Fastify from "fastify";
import cors from "@fastify/cors";
import { registerRoutes } from "./routes/index";

const app = Fastify({ logger: true });

app.register(cors, { origin: true });

registerRoutes(app).then(() => {
  const port = Number(process.env.PORT ?? 3001);
  const host = process.env.HOST ?? "127.0.0.1";
  app.listen({ port, host }, (err) => {
    if (err) {
      app.log.error(err);
      process.exit(1);
    }
    app.log.info(`AgentCourt backend listening on :${port}`);
  });
});
