import { HttpRouter } from "../../../infrastructure/http/http-router";
import type { CreateSaleUseCase } from "../../../application/sales/create-sale.use-case";
import type { ImportSalesCsvUseCase } from "../../../application/sales/import-sales-csv.use-case";
import type { ListSalesUseCase } from "../../../application/sales/list-sales.use-case";
import type { GetSalesSummaryUseCase } from "../../../application/sales/get-sales-summary.use-case";
import { CreateSaleRoute } from "./create-sale.route";
import { ImportSalesRoute } from "./import-sales.route";
import { ListSalesRoute } from "./list-sales.route";
import { GetSalesSummaryRoute } from "./get-sales-summary.route";

export interface SalesDeps {
  createSale: CreateSaleUseCase;
  importSalesCsv: ImportSalesCsvUseCase;
  listSales: ListSalesUseCase;
  getSalesSummary: GetSalesSummaryUseCase;
}

export class SalesRouter extends HttpRouter {
  readonly path = "/sales";

  static create(deps: SalesDeps): SalesRouter {
    return new SalesRouter().register(
      new ListSalesRoute(deps.listSales),
      new CreateSaleRoute(deps.createSale),
      new GetSalesSummaryRoute(deps.getSalesSummary),
      new ImportSalesRoute(deps.importSalesCsv)
    );
  }
}
