import { HttpRouter } from "../../../infrastructure/http/http-router";
import { HealthRoute } from "./health.route";

export class HealthRouter extends HttpRouter {
  readonly path = "/health";

  static create(): HealthRouter {
    return new HealthRouter().register(new HealthRoute());
  }
}
