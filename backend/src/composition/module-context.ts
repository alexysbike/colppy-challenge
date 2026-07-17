import type { DbClient } from "../infrastructure/database/client";
import type { HttpRouter } from "../infrastructure/http/http-router";
import type { Env } from "../shared/config/env";

export interface ModuleContext {
  env: Env;
  db: DbClient;
}

export interface AppModule {
  name: string;
  routers?: HttpRouter[];
  nested?: Record<string, HttpRouter>;
  onInit?: (ctx: ModuleContext) => Promise<void>;
}
