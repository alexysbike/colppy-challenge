import type { Env } from "../shared/config/env";
import { loadEnv } from "../shared/config/env";
import type { DbClient } from "../infrastructure/database/client";
import { createDbClient } from "../infrastructure/database/client";
import type { HttpRouter } from "../infrastructure/http/http-router";
import { bootstrapModules } from "./register-modules";

export interface AppContext {
  env: Env;
  db: DbClient;
  routers: HttpRouter[];
}

export interface CreateAppOptions {
  databasePath?: string;
}

export async function createApp(options: CreateAppOptions = {}): Promise<AppContext> {
  const env = loadEnv();
  const databasePath = options.databasePath ?? env.databasePath;
  const db = createDbClient(databasePath);
  const ctx = { env: { ...env, databasePath }, db };

  const { routers } = await bootstrapModules(ctx);

  return { env: ctx.env, db, routers };
}
