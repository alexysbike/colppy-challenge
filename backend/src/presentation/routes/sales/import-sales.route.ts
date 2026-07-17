import { HttpRoute } from "../../../infrastructure/http/http-route";
import { HttpMethod } from "../../../infrastructure/http/http-method";
import { HttpResult } from "../../../infrastructure/http/http-result";
import type { HttpRequest } from "../../../infrastructure/http/http-request";
import type { ImportSalesCsvUseCase } from "../../../application/sales/import-sales-csv.use-case";
import { ValidationError } from "../../../shared/errors/validation.error";
import { toImportResultResponse } from "../../mappers/sale.mapper";

export class ImportSalesRoute extends HttpRoute {
  readonly path = "/import";
  readonly methods = [HttpMethod.POST];
  readonly multipart = { field: "file", maxFileSize: 5 * 1024 * 1024 };

  constructor(private readonly useCase: ImportSalesCsvUseCase) {
    super();
  }

  protected async post(req: HttpRequest) {
    if (!req.file) {
      throw new ValidationError("file is required");
    }

    const content = req.file.buffer.toString("utf-8");
    const result = await this.useCase.execute(content);
    return HttpResult.ok(toImportResultResponse(result));
  }
}
