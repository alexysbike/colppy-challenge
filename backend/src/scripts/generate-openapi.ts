import { mkdirSync, writeFileSync } from "fs";
import { dirname, resolve } from "path";
import { loadEnv } from "../shared/config/env";
import type { Logger } from "../shared/logging/logger";
import { createLogger } from "../infrastructure/logging/pino-logger";
import { generateOpenApiDocument } from "../presentation/openapi/registry";

export function writeOpenApiDocument(outputPath: string, logger?: Logger): void {
  const env = loadEnv();
  const document = generateOpenApiDocument(env.port);
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, JSON.stringify(document, null, 2));
  logger?.info("OpenAPI document generated", { outputPath });
}

if (require.main === module) {
  const env = loadEnv();
  const { logger } = createLogger(env);
  writeOpenApiDocument(resolve("openapi/swagger.json"), logger);
}
