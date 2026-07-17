import type { Sale } from "../../domain/entities/sale";
import type { ImportSalesCsvResult } from "../../application/sales/import-sales-csv.use-case";
import type { Paginated, SalesSummary } from "../../domain/repositories/sale.repository.types";

export interface SaleResponse {
  id: number;
  externalId: string;
  date: string;
  customer: string;
  product: string;
  quantity: number;
  amount: string;
  paymentMethod: string;
}

export function toSaleResponse(sale: Sale): SaleResponse {
  return {
    id: sale.id,
    externalId: sale.externalId,
    date: sale.date,
    customer: sale.customer,
    product: sale.product,
    quantity: sale.quantity,
    amount: sale.amount,
    paymentMethod: sale.paymentMethod,
  };
}

export function toSaleListResponse(result: Paginated<Sale>) {
  return {
    data: result.data.map(toSaleResponse),
    meta: result.meta,
  };
}

export function toSalesSummaryResponse(summary: SalesSummary) {
  return summary;
}

export function toImportResultResponse(result: ImportSalesCsvResult) {
  return result;
}
