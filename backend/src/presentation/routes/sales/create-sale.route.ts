import { HttpRoute } from "../../../infrastructure/http/http-route";
import { HttpMethod } from "../../../infrastructure/http/http-method";
import { HttpResult } from "../../../infrastructure/http/http-result";
import type { HttpRequest } from "../../../infrastructure/http/http-request";
import type { CreateSaleUseCase } from "../../../application/sales/create-sale.use-case";
import { createSaleSchema } from "../../validators/sale.schemas";
import { toSaleResponse } from "../../mappers/sale.mapper";

export class CreateSaleRoute extends HttpRoute {
  readonly path = "/";
  readonly methods = [HttpMethod.POST];

  constructor(private readonly useCase: CreateSaleUseCase) {
    super();
  }

  protected async post(req: HttpRequest) {
    const input = createSaleSchema.parse(req.body);
    const result = await this.useCase.execute(input);
    const body = toSaleResponse(result.sale);
    return result.created ? body : HttpResult.ok(body);
  }
}
