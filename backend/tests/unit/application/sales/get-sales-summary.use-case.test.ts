import type { SaleRepository } from "../../../../src/domain/repositories/sale.repository";
import { GetSalesSummaryUseCase } from "../../../../src/application/sales/get-sales-summary.use-case";
import { ValidationError } from "../../../../src/shared/errors/validation.error";

describe("GetSalesSummaryUseCase", () => {
  const summary = {
    from: "2026-05-01",
    to: "2026-05-31",
    count: 2,
    totalAmount: "100.00",
    byPaymentMethod: {
      transferencia: { count: 1, totalAmount: "50.00" },
      tarjeta: { count: 1, totalAmount: "50.00" },
      efectivo: { count: 0, totalAmount: "0.00" },
    },
  };

  const repository: SaleRepository = {
    create: jest.fn(),
    findByExternalId: jest.fn(),
    list: jest.fn(),
    getSummary: jest.fn().mockResolvedValue(summary),
  };

  const useCase = new GetSalesSummaryUseCase(repository);

  it("resolves month to full date range", async () => {
    const result = await useCase.execute({ month: "2026-05" });

    expect(repository.getSummary).toHaveBeenCalledWith("2026-05-01", "2026-05-31");
    expect(result).toEqual(summary);
  });

  it("resolves february in leap year", async () => {
    await useCase.execute({ month: "2024-02" });
    expect(repository.getSummary).toHaveBeenCalledWith("2024-02-01", "2024-02-29");
  });

  it("uses from and to when month is not provided", async () => {
    await useCase.execute({ from: "2026-05-10", to: "2026-05-20" });
    expect(repository.getSummary).toHaveBeenCalledWith("2026-05-10", "2026-05-20");
  });

  it("throws when month and from/to are both provided", async () => {
    await expect(
      useCase.execute({ month: "2026-05", from: "2026-05-01", to: "2026-05-31" })
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("throws when month format is invalid", async () => {
    await expect(useCase.execute({ month: "2026-5" })).rejects.toBeInstanceOf(ValidationError);
  });

  it("throws when month is out of range", async () => {
    await expect(useCase.execute({ month: "2026-13" })).rejects.toBeInstanceOf(ValidationError);
  });

  it("throws when from and to are missing", async () => {
    await expect(useCase.execute({})).rejects.toBeInstanceOf(ValidationError);
  });

  it("throws when from is after to", async () => {
    await expect(useCase.execute({ from: "2026-05-31", to: "2026-05-01" })).rejects.toBeInstanceOf(
      ValidationError
    );
  });
});
