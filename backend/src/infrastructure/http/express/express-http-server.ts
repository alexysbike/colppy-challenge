import express, { type Express } from "express";
import type { IncomingMessage, ServerResponse } from "http";
import pinoHttp, { startTime } from "pino-http";
import type { Logger as PinoLogger } from "pino";
import { HttpServer } from "../http-server";
import type { HttpServerConfig } from "../http-server";
import { flattenRouters, toExpressMethod } from "../path-utils";
import { adaptRequest } from "./adapters/express-request.adapter";
import { adaptResponse } from "./adapters/express-response.adapter";
import { parseExpressMultipart } from "./multipart/parse-express-multipart";
import {
  asyncHandler,
  wrapErrorHandler,
  wrapMiddleware,
} from "./middleware/async-handler.middleware";
import { createErrorHandler } from "./middleware/error-handler.middleware";
import { registerSwaggerUi } from "./swagger-ui.setup";

export interface ExpressBuildConfig extends HttpServerConfig {
  pinoLogger: PinoLogger;
}

function shouldIgnoreRequestLog(url: string | undefined): boolean {
  if (!url) {
    return false;
  }

  return url === "/health" || url.startsWith("/doc");
}

export function buildExpressApp(config: ExpressBuildConfig): Express {
  const app = express();
  app.use(
    pinoHttp({
      logger: config.pinoLogger,
      quietReqLogger: true,
      autoLogging: {
        ignore: (req) => shouldIgnoreRequestLog(req.url),
      },
      serializers: {
        req: (req) => ({
          method: req.method,
          url: req.url,
        }),
        res: (res) => ({
          statusCode: res.statusCode,
        }),
      },
      customSuccessMessage: (req, res, responseTime) =>
        `${req.method} ${req.url} ${res.statusCode} ${responseTime}ms`,
      customErrorMessage: (req: IncomingMessage, res: ServerResponse, err: Error) => {
        const responseTime = Date.now() - res[startTime];
        return `${req.method} ${req.url} ${res.statusCode} ${responseTime}ms - ${err.message}`;
      },
    })
  );
  app.use(express.json());

  config.middlewares?.forEach((mw) => app.use(wrapMiddleware(mw)));

  for (const { path, route } of flattenRouters(config.routers)) {
    const handler = asyncHandler(async (req, res) => {
      const file = route.multipart ? await parseExpressMultipart(req, route.multipart) : undefined;

      await route.execute(adaptRequest(req, { file }), adaptResponse(res));
    });

    for (const method of route.methods) {
      app[toExpressMethod(method)](path, handler);
    }
  }

  app.use(wrapErrorHandler(createErrorHandler(config.logger)));
  registerSwaggerUi(app, config.env);

  return app;
}

export class ExpressHttpServer extends HttpServer {
  constructor(protected readonly config: ExpressBuildConfig) {
    super(config);
  }

  run(): void {
    const app = buildExpressApp(this.config);
    app.listen(this.config.port, () => {
      this.config.logger.info(`Server running on http://localhost:${this.config.port}`);
    });
  }
}
