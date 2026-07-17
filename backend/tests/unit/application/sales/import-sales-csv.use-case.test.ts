import type { CreateSaleUseCase } from "../../../../src/application/sales/create-sale.use-case";
import { ImportSalesCsvUseCase } from "../../../../src/application/sales/import-sales-csv.use-case";
import { ConflictError } from "../../../../src/shared/errors/conflict.error";
import { ValidationError } from "../../../../src/shared/errors/validation.error";

function buildSale(input: { externalId: string }) {
  return {
    id: 1,
    externalId: input.externalId,
    date: "2026-05-02",
    customer: "Cliente",
    product: "Producto",
    quantity: 1,
    amount: "100.00",
    paymentMethod: "transferencia" as const,
    createdAt: "2026-05-01T00:00:00.000Z",
  };
}

describe("ImportSalesCsvUseCase", () => {
  const header = "id_venta,fecha,cliente,producto,cantidad,importe,medio_pago";
  const validRow = "V-1001,2026-05-02,Cliente,Producto,1,100.00,transferencia";

  it("imports new rows as created", async () => {
    const createSale: CreateSaleUseCase = {
      execute: jest
        .fn()
        .mockResolvedValue({ sale: buildSale({ externalId: "V-1001" }), created: true }),
    } as unknown as CreateSaleUseCase;

    const useCase = new ImportSalesCsvUseCase(createSale);
    const result = await useCase.execute(`${header}\n${validRow}`);

    expect(result).toEqual({
      created: 1,
      skipped: 0,
      failed: 0,
      errors: [],
    });
  });

  it("counts skipped rows when sale already exists with same data", async () => {
    const createSale: CreateSaleUseCase = {
      execute: jest
        .fn()
        .mockResolvedValue({ sale: buildSale({ externalId: "V-1001" }), created: false }),
    } as unknown as CreateSaleUseCase;

    const useCase = new ImportSalesCsvUseCase(createSale);
    const result = await useCase.execute(`${header}\n${validRow}`);

    expect(result.created).toBe(0);
    expect(result.skipped).toBe(1);
    expect(result.failed).toBe(0);
  });

  it("counts failed rows on conflict", async () => {
    const createSale: CreateSaleUseCase = {
      execute: jest.fn().mockRejectedValue(new ConflictError("Sale V-1001 already exists")),
    } as unknown as CreateSaleUseCase;

    const useCase = new ImportSalesCsvUseCase(createSale);
    const result = await useCase.execute(`${header}\n${validRow}`);

    expect(result.created).toBe(0);
    expect(result.skipped).toBe(0);
    expect(result.failed).toBe(1);
    expect(result.errors[0]).toMatchObject({
      row: 2,
      externalId: "V-1001",
      error: "Sale V-1001 already exists",
    });
  });

  it("counts failed rows on unexpected errors", async () => {
    const createSale: CreateSaleUseCase = {
      execute: jest.fn().mockRejectedValue(new Error("db down")),
    } as unknown as CreateSaleUseCase;

    const useCase = new ImportSalesCsvUseCase(createSale);
    const result = await useCase.execute(`${header}\n${validRow}`);

    expect(result.failed).toBe(1);
    expect(result.errors[0]?.error).toBe("Failed to import row");
  });

  it("includes parse errors in failed count", async () => {
    const createSale: CreateSaleUseCase = {
      execute: jest.fn(),
    } as unknown as CreateSaleUseCase;

    const useCase = new ImportSalesCsvUseCase(createSale);
    const result = await useCase.execute(`${header}\nINVALID,2026-05-02,C,P,1,10,transferencia`);

    expect(result.created).toBe(0);
    expect(result.failed).toBe(1);
    expect(createSale.execute).not.toHaveBeenCalled();
  });

  it("throws on empty csv", async () => {
    const createSale: CreateSaleUseCase = {
      execute: jest.fn(),
    } as unknown as CreateSaleUseCase;

    const useCase = new ImportSalesCsvUseCase(createSale);
    await expect(useCase.execute("")).rejects.toBeInstanceOf(ValidationError);
  });

  it("processes multiple rows with mixed outcomes", async () => {
    const createSale: CreateSaleUseCase = {
      execute: jest
        .fn()
        .mockResolvedValueOnce({ sale: buildSale({ externalId: "V-1001" }), created: true })
        .mockResolvedValueOnce({ sale: buildSale({ externalId: "V-1002" }), created: false })
        .mockRejectedValueOnce(new ConflictError("conflict")),
    } as unknown as CreateSaleUseCase;

    const csv = [
      header,
      validRow,
      "V-1002,2026-05-03,Cliente,Producto,1,50.00,efectivo",
      "V-1003,2026-05-04,Cliente,Producto,1,75.00,tarjeta",
    ].join("\n");

    const useCase = new ImportSalesCsvUseCase(createSale);
    const result = await useCase.execute(csv);

    expect(result.created).toBe(1);
    expect(result.skipped).toBe(1);
    expect(result.failed).toBe(1);
  });
});
