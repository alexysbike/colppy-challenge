import { HttpRoute } from "../../../../src/infrastructure/http/http-route";
import { HttpMethod } from "../../../../src/infrastructure/http/http-method";
import { HttpResult } from "../../../../src/infrastructure/http/http-result";
import { AppError } from "../../../../src/shared/errors/app.error";
import { ErrorCode } from "../../../../src/shared/errors/error-codes";
import type { HttpRequest, HttpResponse } from "../../../../src/infrastructure/http/http-request";

class TestRoute extends HttpRoute {
  readonly path = "/test";
  readonly methods = [HttpMethod.GET, HttpMethod.POST, HttpMethod.DELETE];

  handler: (req: HttpRequest) => unknown = () => ({ ok: true });

  protected get(req: HttpRequest) {
    return this.handler(req);
  }

  protected post(req: HttpRequest) {
    return this.handler(req);
  }

  protected delete() {
    return undefined;
  }
}

function createMocks() {
  const res: HttpResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    send: jest.fn(),
  };
  const req = (method: HttpMethod): HttpRequest => ({
    method,
    path: "/test",
    params: {},
    query: {},
    body: {},
  });
  return { res, req };
}

describe("HttpRoute", () => {
  const route = new TestRoute();

  it("sends 200 json for GET by default", async () => {
    const { req, res } = createMocks();
    await route.execute(req(HttpMethod.GET), res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ ok: true });
  });

  it("sends 201 json for POST by default", async () => {
    const { req, res } = createMocks();
    await route.execute(req(HttpMethod.POST), res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ ok: true });
  });

  it("sends 204 without body for DELETE when handler returns undefined", async () => {
    const { req, res } = createMocks();
    await route.execute(req(HttpMethod.DELETE), res);
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it("respects HttpResult.ok override on POST", async () => {
    route.handler = () => HttpResult.ok({ existing: true });
    const { req, res } = createMocks();
    await route.execute(req(HttpMethod.POST), res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ existing: true });
  });

  it("throws 405 for unsupported method", async () => {
    const { req, res } = createMocks();
    await expect(route.execute(req(HttpMethod.PUT), res)).rejects.toMatchObject({
      statusCode: 405,
      code: ErrorCode.METHOD_NOT_ALLOWED,
    });
  });

  it("throws when GET is not implemented on base route", async () => {
    class PostOnlyRoute extends HttpRoute {
      readonly path = "/";
      readonly methods = [HttpMethod.POST];
    }
    const { req, res } = createMocks();
    await expect(
      new PostOnlyRoute().execute({ ...req(HttpMethod.POST), method: HttpMethod.GET }, res)
    ).rejects.toBeInstanceOf(AppError);
  });
});
