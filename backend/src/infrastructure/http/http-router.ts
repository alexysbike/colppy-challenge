import type { HttpRoute } from "./http-route";

export abstract class HttpRouter {
  abstract readonly path: string;
  protected readonly routes: HttpRoute[] = [];
  protected readonly routers: HttpRouter[] = [];

  register(...routes: HttpRoute[]): this {
    this.routes.push(...routes);
    return this;
  }

  mount(...routers: HttpRouter[]): this {
    this.routers.push(...routers);
    return this;
  }

  getRoutes(): readonly HttpRoute[] {
    return this.routes;
  }

  getRouters(): readonly HttpRouter[] {
    return this.routers;
  }
}
