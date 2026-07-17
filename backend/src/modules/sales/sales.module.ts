import type { AppModule, ModuleContext } from "../../composition/module-context";
import { CreateSaleUseCase } from "../../application/sales/create-sale.use-case";
import { ImportSalesCsvUseCase } from "../../application/sales/import-sales-csv.use-case";
import { ListSalesUseCase } from "../../application/sales/list-sales.use-case";
import { GetSalesSummaryUseCase } from "../../application/sales/get-sales-summary.use-case";
import { DrizzleSaleRepository } from "../../infrastructure/repositories/drizzle-sale.repository";
import { SalesRouter } from "../../presentation/routes/sales/sales.router";

export function createSalesModule(ctx: ModuleContext): AppModule {
  const repository = new DrizzleSaleRepository(ctx.db);
  const createSale = new CreateSaleUseCase(repository);
  const deps = {
    createSale,
    importSalesCsv: new ImportSalesCsvUseCase(createSale),
    listSales: new ListSalesUseCase(repository),
    getSalesSummary: new GetSalesSummaryUseCase(repository),
  };

  return {
    name: "sales",
    routers: [SalesRouter.create(deps)],
  };
}
