import { HttpRoute } from "../../../infrastructure/http/http-route";
import { HttpMethod } from "../../../infrastructure/http/http-method";
import type { HttpRequest } from "../../../infrastructure/http/http-request";

export class HealthRoute extends HttpRoute {
  readonly path = "/";
  readonly methods = [HttpMethod.GET];

  protected get(_req: HttpRequest) {
    return { status: "ok" };
  }
}
