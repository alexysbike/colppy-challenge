import { HttpRoute } from "../../../infrastructure/http/http-route";
import { HttpMethod } from "../../../infrastructure/http/http-method";
import type { HttpRequest } from "../../../infrastructure/http/http-request";
import type { ListSalesUseCase } from "../../../application/sales/list-sales.use-case";
import { listSalesQuerySchema } from "../../validators/sale.schemas";
import { toSaleListResponse } from "../../mappers/sale.mapper";

export class ListSalesRoute extends HttpRoute {
  readonly path = "/";
  readonly methods = [HttpMethod.GET];

  constructor(private readonly useCase: ListSalesUseCase) {
    super();
  }

  protected async get(req: HttpRequest) {
    const query = listSalesQuerySchema.parse(req.query);
    const result = await this.useCase.execute(query);
    return toSaleListResponse(result);
  }
}
