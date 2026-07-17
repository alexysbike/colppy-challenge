import { HttpRoute } from "../../../infrastructure/http/http-route";
import { HttpMethod } from "../../../infrastructure/http/http-method";
import type { HttpRequest } from "../../../infrastructure/http/http-request";
import type { GetSalesSummaryUseCase } from "../../../application/sales/get-sales-summary.use-case";
import { salesSummaryQuerySchema } from "../../validators/sale.schemas";
import { toSalesSummaryResponse } from "../../mappers/sale.mapper";

export class GetSalesSummaryRoute extends HttpRoute {
  readonly path = "/summary";
  readonly methods = [HttpMethod.GET];

  constructor(private readonly useCase: GetSalesSummaryUseCase) {
    super();
  }

  protected async get(req: HttpRequest) {
    const query = salesSummaryQuerySchema.parse(req.query);
    const result = await this.useCase.execute(query);
    return toSalesSummaryResponse(result);
  }
}
