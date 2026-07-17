import { resolve } from "path";
import { loadEnv } from "./shared/config/env";
import { runMigrations } from "./infrastructure/database/migrate";
import { createLogger } from "./infrastructure/logging/pino-logger";
import { writeOpenApiDocument } from "./scripts/generate-openapi";
import { createHttpServer } from "./composition/create-http-server";

const env = loadEnv();
const { logger } = createLogger(env);

async function bootstrap(): Promise<void> {
  await runMigrations(env.databasePath);
  writeOpenApiDocument(resolve("openapi/swagger.json"), logger);
  const server = await createHttpServer(env.databasePath);
  server.run();
}

bootstrap().catch((err) => logger.error("Bootstrap failed", { err }));
