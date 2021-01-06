import "reflect-metadata";
import Koa from "koa";
import dotenv from "dotenv";

import cors from "./middleware/cors";
import { log } from "./utils/helper";

import initialize from "./server";

const dev = process.env.NODE_ENV === "development";

dotenv.config({ path: dev ? ".env.dev" : ".env.prod" });

log(`[Env] Loading ${dev ? "[DEV]" : "[PROD]"} File`);

const PORT = process.env.PORT || 4000;

async function bootstrap() {
  const app = new Koa();

  app.use(cors);

  const server = await initialize();

  const httpServer = app.listen(PORT, () => {
    log(`[Apollo Server] Server ready at http://localhost:${PORT}/graphql`);
  });

  server.applyMiddleware({ app });

  server.installSubscriptionHandlers(httpServer);
}

log(`=== [GraphQL Explorer] Bootstrapping ===`);
bootstrap();
