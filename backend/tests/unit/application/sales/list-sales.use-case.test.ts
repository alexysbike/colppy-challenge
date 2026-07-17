import type { SaleRepository } from "../../../../src/domain/repositories/sale.repository";
import { ListSalesUseCase } from "../../../../src/application/sales/list-sales.use-case";

describe("ListSalesUseCase", () => {
  it("delegates to repository with filters", async () => {
    const paginated = {
      data: [
        {
          id: 1,
          externalId: "V-1001",
          date: "2026-05-02",
          customer: "Cliente",
          product: "Producto",
          quantity: 1,
          amount: "100.00",
          paymentMethod: "transferencia" as const,
          createdAt: "2026-05-01T00:00:00.000Z",
        },
      ],
      meta: { page: 1, limit: 20, total: 1 },
    };

    const repository: SaleRepository = {
      create: jest.fn(),
      findByExternalId: jest.fn(),
      list: jest.fn().mockResolvedValue(paginated),
      getSummary: jest.fn(),
    };

    const useCase = new ListSalesUseCase(repository);
    const filters = { from: "2026-05-01", to: "2026-05-31", page: 1, limit: 20 };
    const result = await useCase.execute(filters);

    expect(repository.list).toHaveBeenCalledWith(filters);
    expect(result).toEqual(paginated);
  });
});
