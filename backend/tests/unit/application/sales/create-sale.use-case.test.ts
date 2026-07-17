import type { SaleRepository } from "../../../../src/domain/repositories/sale.repository";
import type { CreateSaleInput } from "../../../../src/domain/repositories/sale.repository.types";
import type { Sale } from "../../../../src/domain/entities/sale";
import { CreateSaleUseCase } from "../../../../src/application/sales/create-sale.use-case";
import { ConflictError } from "../../../../src/shared/errors/conflict.error";

function buildSale(input: CreateSaleInput, id = 1): Sale {
  return {
    id,
    externalId: input.externalId,
    date: input.date,
    customer: input.customer,
    product: input.product,
    quantity: input.quantity,
    amount: input.amount,
    paymentMethod: input.paymentMethod,
    createdAt: "2026-05-01T00:00:00.000Z",
  };
}

describe("CreateSaleUseCase", () => {
  const input: CreateSaleInput = {
    externalId: "V-1001",
    date: "2026-05-02",
    customer: "Comercial Andrade",
    product: "Servicio de consultoria",
    quantity: 1,
    amount: "18500.00",
    paymentMethod: "transferencia",
  };

  const baseRepository = {
    findByExternalIds: jest.fn().mockReturnValue(new Map()),
    insertMany: jest.fn(),
    runInTransaction: jest.fn((fn: (repo: SaleRepository) => unknown) =>
      fn(baseRepository as SaleRepository)
    ),
    list: jest.fn(),
    getSummary: jest.fn(),
  };

  it("creates a new sale", async () => {
    const repository: SaleRepository = {
      ...baseRepository,
      create: jest.fn().mockResolvedValue(buildSale(input)),
      findByExternalId: jest.fn().mockResolvedValue(null),
    };

    const useCase = new CreateSaleUseCase(repository);
    const result = await useCase.execute(input);

    expect(result.created).toBe(true);
    expect(result.sale.externalId).toBe("V-1001");
    expect(repository.create).toHaveBeenCalled();
  });

  it("returns existing sale when data matches", async () => {
    const existing = buildSale(input);
    const repository: SaleRepository = {
      ...baseRepository,
      create: jest.fn(),
      findByExternalId: jest.fn().mockResolvedValue(existing),
    };

    const useCase = new CreateSaleUseCase(repository);
    const result = await useCase.execute(input);

    expect(result.created).toBe(false);
    expect(result.sale).toEqual(existing);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it("throws conflict when external id exists with different data", async () => {
    const existing = buildSale({ ...input, amount: "999.00" });
    const repository: SaleRepository = {
      ...baseRepository,
      create: jest.fn(),
      findByExternalId: jest.fn().mockResolvedValue(existing),
    };

    const useCase = new CreateSaleUseCase(repository);

    await expect(useCase.execute(input)).rejects.toBeInstanceOf(ConflictError);
  });

  it("imports new rows in a single transaction", () => {
    const repository: SaleRepository = {
      ...baseRepository,
      create: jest.fn(),
      findByExternalId: jest.fn(),
      findByExternalIds: jest.fn().mockReturnValue(new Map()),
      insertMany: jest.fn(),
      runInTransaction: jest.fn((fn) => fn(repository)),
    };

    const useCase = new CreateSaleUseCase(repository);
    const results = useCase.importBatch([input]);

    expect(results).toEqual([{ status: "created" }]);
    expect(repository.runInTransaction).toHaveBeenCalled();
    expect(repository.insertMany).toHaveBeenCalledWith([input]);
  });

  it("skips rows that already exist with matching data", () => {
    const existing = buildSale(input);
    const repository: SaleRepository = {
      ...baseRepository,
      create: jest.fn(),
      findByExternalId: jest.fn(),
      findByExternalIds: jest.fn().mockReturnValue(new Map([[input.externalId, existing]])),
      insertMany: jest.fn(),
      runInTransaction: jest.fn((fn) => fn(repository)),
    };

    const useCase = new CreateSaleUseCase(repository);
    const results = useCase.importBatch([input]);

    expect(results).toEqual([{ status: "skipped" }]);
    expect(repository.insertMany).not.toHaveBeenCalled();
  });

  it("marks rows as failed when external id exists with different data", () => {
    const existing = buildSale({ ...input, amount: "999.00" });
    const repository: SaleRepository = {
      ...baseRepository,
      create: jest.fn(),
      findByExternalId: jest.fn(),
      findByExternalIds: jest.fn().mockReturnValue(new Map([[input.externalId, existing]])),
      insertMany: jest.fn(),
      runInTransaction: jest.fn((fn) => fn(repository)),
    };

    const useCase = new CreateSaleUseCase(repository);
    const results = useCase.importBatch([input]);

    expect(results).toEqual([
      {
        status: "failed",
        error: "Sale V-1001 already exists with different data",
      },
    ]);
    expect(repository.insertMany).not.toHaveBeenCalled();
  });
});
