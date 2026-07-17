import type { HttpServer } from "../infrastructure/http/http-server";
import { ExpressHttpServer } from "../infrastructure/http/express/express-http-server";
import { createLogger } from "../infrastructure/logging/pino-logger";
import { createApp } from "./create-app";

export async function createHttpServer(databasePath?: string): Promise<HttpServer> {
  const { env, routers } = await createApp({ databasePath });
  const { logger, pino } = createLogger(env);
  return new ExpressHttpServer({
    port: env.port,
    routers,
    env,
    logger,
    pinoLogger: pino,
  });
}
