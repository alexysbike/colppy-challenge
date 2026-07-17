import { existsSync, readFileSync } from "fs";
import { resolve } from "path";
import type { Express } from "express";
import swaggerUi from "swagger-ui-express";
import type { Env } from "../../../shared/config/env";

export function registerSwaggerUi(app: Express, env: Env): void {
  if (env.isProduction) return;

  const specPath = resolve("openapi/swagger.json");
  if (!existsSync(specPath)) return;

  const spec = JSON.parse(readFileSync(specPath, "utf-8"));
  app.use("/doc", swaggerUi.serve, swaggerUi.setup(spec));
}
