import type { Express } from "express";
import { closeDbClient } from "../../src/infrastructure/database/client";
import { buildExpressApp } from "../../src/infrastructure/http/express/express-http-server";
import { createLogger } from "../../src/infrastructure/logging/pino-logger";
import { createApp } from "../../src/composition/create-app";

export interface TestAppContext {
  app: Express;
  dispose: () => void;
}

export async function createTestApp(dbPath: string): Promise<TestAppContext> {
  const { env, routers, db } = await createApp({ databasePath: dbPath });
  const { logger, pino } = createLogger(env);
  const app = buildExpressApp({ port: env.port, routers, env, logger, pinoLogger: pino });

  return {
    app,
    dispose: () => closeDbClient(db),
  };
}
