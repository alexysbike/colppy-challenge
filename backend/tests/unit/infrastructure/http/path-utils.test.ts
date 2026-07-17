import { HttpRoute } from "../../../../src/infrastructure/http/http-route";
import { HttpRouter } from "../../../../src/infrastructure/http/http-router";
import { HttpMethod } from "../../../../src/infrastructure/http/http-method";
import {
  flattenRouters,
  joinPaths,
  toExpressMethod,
} from "../../../../src/infrastructure/http/path-utils";

class StubRoute extends HttpRoute {
  constructor(
    readonly path: string,
    readonly methods: HttpMethod[]
  ) {
    super();
  }
}

class StubRouter extends HttpRouter {
  constructor(readonly path: string) {
    super();
  }
}

describe("joinPaths", () => {
  it.each([
    ["/sales", "/", "/sales"],
    ["/sales", "", "/sales"],
    ["/sales", "/import", "/sales/import"],
    ["/sales/", "/import", "/sales/import"],
    ["", "/health", "/health"],
    ["/", "/health", "/health"],
    ["/api", "sales", "/api/sales"],
    ["/api/", "sales", "/api/sales"],
    ["", "", "/"],
    ["/", "/", "/"],
  ])("joinPaths(%s, %s) => %s", (prefix, routePath, expected) => {
    expect(joinPaths(prefix, routePath)).toBe(expected);
  });
});

describe("toExpressMethod", () => {
  it.each([
    ["GET", "get"],
    ["POST", "post"],
    ["PUT", "put"],
    ["PATCH", "patch"],
    ["DELETE", "delete"],
  ])("maps %s to %s", (method, expected) => {
    expect(toExpressMethod(method)).toBe(expected);
  });
});

describe("flattenRouters", () => {
  it("flattens nested routers with correct paths", () => {
    const listRoute = new StubRoute("/", [HttpMethod.GET]);
    const createRoute = new StubRoute("/", [HttpMethod.POST]);
    const importRoute = new StubRoute("/import", [HttpMethod.POST]);

    const salesRouter = new StubRouter("/sales").register(listRoute, createRoute, importRoute);
    const apiRouter = new StubRouter("/api").mount(salesRouter);
    const healthRoute = new StubRoute("/", [HttpMethod.GET]);
    const rootRouter = new StubRouter("").register(healthRoute).mount(apiRouter);

    const mounted = flattenRouters([rootRouter]);

    expect(mounted).toEqual(
      expect.arrayContaining([
        { path: "/", route: healthRoute },
        { path: "/api/sales", route: listRoute },
        { path: "/api/sales", route: createRoute },
        { path: "/api/sales/import", route: importRoute },
      ])
    );
    expect(mounted).toHaveLength(4);
  });

  it("returns empty array for router without routes", () => {
    expect(flattenRouters([new StubRouter("/empty")])).toEqual([]);
  });
});
