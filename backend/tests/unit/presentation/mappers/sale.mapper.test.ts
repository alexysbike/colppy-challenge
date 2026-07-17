import type { Sale } from "../../../../src/domain/entities/sale";
import {
  toImportResultResponse,
  toSaleListResponse,
  toSaleResponse,
  toSalesSummaryResponse,
} from "../../../../src/presentation/mappers/sale.mapper";

const sale: Sale = {
  id: 1,
  externalId: "V-1001",
  date: "2026-05-02",
  customer: "Cliente",
  product: "Producto",
  quantity: 2,
  amount: "100.00",
  paymentMethod: "transferencia",
  createdAt: "2026-05-01T00:00:00.000Z",
};

describe("sale.mapper", () => {
  it("toSaleResponse maps sale fields", () => {
    expect(toSaleResponse(sale)).toEqual({
      id: 1,
      externalId: "V-1001",
      date: "2026-05-02",
      customer: "Cliente",
      product: "Producto",
      quantity: 2,
      amount: "100.00",
      paymentMethod: "transferencia",
    });
  });

  it("toSaleListResponse maps data and meta", () => {
    const result = toSaleListResponse({
      data: [sale],
      meta: { page: 1, limit: 20, total: 1 },
    });

    expect(result.data).toHaveLength(1);
    expect(result.data[0]?.externalId).toBe("V-1001");
    expect(result.meta).toEqual({ page: 1, limit: 20, total: 1 });
  });

  it("toSalesSummaryResponse returns summary as-is", () => {
    const summary = {
      from: "2026-05-01",
      to: "2026-05-31",
      count: 1,
      totalAmount: "100.00",
      byPaymentMethod: {
        transferencia: { count: 1, totalAmount: "100.00" },
        tarjeta: { count: 0, totalAmount: "0.00" },
        efectivo: { count: 0, totalAmount: "0.00" },
      },
    };
    expect(toSalesSummaryResponse(summary)).toBe(summary);
  });

  it("toImportResultResponse returns import result as-is", () => {
    const importResult = { created: 1, skipped: 0, failed: 0, errors: [] };
    expect(toImportResultResponse(importResult)).toBe(importResult);
  });
});
