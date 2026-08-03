import Fastify from "fastify";
import cors from "@fastify/cors";
import { registerRoutes } from "./routes/index";

const app = Fastify({ logger: true });

app.register(cors, { origin: true });

registerRoutes(app).then(() => {
  const port = Number(process.env.PORT ?? 3001);
  app.listen({ port }, (err) => {
    if (err) {
      app.log.error(err);
      process.exit(1);
    }
    app.log.info(`AgentCourt backend listening on :${port}`);
  });
});
