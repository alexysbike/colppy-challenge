import request from "supertest";
import { buildExpressApp } from "../../../../src/infrastructure/http/express/express-http-server";
import { HttpRoute } from "../../../../src/infrastructure/http/http-route";
import { HttpRouter } from "../../../../src/infrastructure/http/http-router";
import { HttpMethod } from "../../../../src/infrastructure/http/http-method";
import { createLogger } from "../../../../src/infrastructure/logging/pino-logger";
import { ValidationError } from "../../../../src/shared/errors/validation.error";
import { ConflictError } from "../../../../src/shared/errors/conflict.error";
import { loadEnv } from "../../../../src/shared/config/env";

class ErrorRoute extends HttpRoute {
  readonly path = "/error";
  readonly methods = [HttpMethod.GET];

  constructor(private readonly error: Error) {
    super();
  }

  protected get() {
    throw this.error;
  }
}

class OkRoute extends HttpRoute {
  readonly path = "/ok";
  readonly methods = [HttpMethod.GET];

  protected get() {
    return { status: "ok" };
  }
}

class TestRouter extends HttpRouter {
  readonly path = "/test";

  static create(routes: HttpRoute[]) {
    const router = new TestRouter();
    router.register(...routes);
    return router;
  }
}

function buildTestApp(...routes: HttpRoute[]) {
  const env = loadEnv();
  const { logger, pino } = createLogger(env);
  return buildExpressApp({
    port: 0,
    env,
    logger,
    pinoLogger: pino,
    routers: [TestRouter.create(routes)],
  });
}

describe("buildExpressApp", () => {
  it("serves registered routes", async () => {
    const app = buildTestApp(new OkRoute());
    const res = await request(app).get("/test/ok");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });

  it("maps ValidationError to 400", async () => {
    const app = buildTestApp(new ErrorRoute(new ValidationError("bad input")));
    const res = await request(app).get("/test/error");
    expect(res.status).toBe(400);
    expect(res.body.code).toBe("VALIDATION_ERROR");
  });

  it("maps ConflictError to 409", async () => {
    const app = buildTestApp(new ErrorRoute(new ConflictError("duplicate")));
    const res = await request(app).get("/test/error");
    expect(res.status).toBe(409);
    expect(res.body.code).toBe("CONFLICT");
  });

  it("maps unhandled errors to 500", async () => {
    const app = buildTestApp(new ErrorRoute(new Error("boom")));
    const res = await request(app).get("/test/error");
    expect(res.status).toBe(500);
    expect(res.body.code).toBe("INTERNAL_ERROR");
  });
});
