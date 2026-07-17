import type { Env } from "../../shared/config/env";
import type { Logger } from "../../shared/logging/logger";
import type { HttpMiddleware } from "./http-request";
import type { HttpRouter } from "./http-router";

export interface HttpServerConfig {
  port: number;
  routers: HttpRouter[];
  middlewares?: HttpMiddleware[];
  env: Env;
  logger: Logger;
}

export abstract class HttpServer {
  constructor(protected readonly config: HttpServerConfig) {}

  abstract run(): void;
}
