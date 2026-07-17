import { DrizzleSaleRepository } from "../../../../src/infrastructure/repositories/drizzle-sale.repository";
import { closeDbClient, createDbClient } from "../../../../src/infrastructure/database/client";
import { ConflictError } from "../../../../src/shared/errors/conflict.error";
import { setupTestDb } from "../../../helpers/test-db";

describe("DrizzleSaleRepository", () => {
  let dbPath: string;
  let cleanup: () => void;
  let repository: DrizzleSaleRepository;
  let db: ReturnType<typeof createDbClient>;

  const baseInput = {
    externalId: "V-1001",
    date: "2026-05-02",
    customer: "Comercial Andrade",
    product: "Servicio",
    quantity: 1,
    amount: "18500.00",
    paymentMethod: "transferencia" as const,
  };

  beforeEach(async () => {
    ({ dbPath, cleanup } = await setupTestDb());
    db = createDbClient(dbPath);
    repository = new DrizzleSaleRepository(db);
  });

  afterEach(() => {
    closeDbClient(db);
    cleanup();
  });

  it("creates and finds a sale by externalId", async () => {
    const created = await repository.create(baseInput);
    const found = await repository.findByExternalId("V-1001");

    expect(created.id).toBeGreaterThan(0);
    expect(found).toMatchObject({
      externalId: "V-1001",
      amount: "18500.00",
      paymentMethod: "transferencia",
    });
  });

  it("returns null when externalId does not exist", async () => {
    expect(await repository.findByExternalId("V-9999")).toBeNull();
  });

  it("throws ConflictError on duplicate externalId", async () => {
    await repository.create(baseInput);
    await expect(repository.create({ ...baseInput, externalId: "V-1001" })).rejects.toBeInstanceOf(
      ConflictError
    );
  });

  it("lists sales with date filters and pagination", async () => {
    await repository.create({ ...baseInput, externalId: "V-2001", date: "2026-05-01" });
    await repository.create({ ...baseInput, externalId: "V-2002", date: "2026-05-10" });
    await repository.create({ ...baseInput, externalId: "V-2003", date: "2026-06-01" });

    const page1 = await repository.list({
      from: "2026-05-01",
      to: "2026-05-31",
      page: 1,
      limit: 2,
    });

    expect(page1.data).toHaveLength(2);
    expect(page1.meta.total).toBe(2);
    expect(page1.data[0]!.date >= page1.data[1]!.date).toBe(true);

    const page2 = await repository.list({
      from: "2026-05-01",
      to: "2026-05-31",
      page: 2,
      limit: 2,
    });
    expect(page2.data).toHaveLength(0);
    expect(page2.meta.total).toBe(2);
  });

  it("lists all sales without date filters", async () => {
    await repository.create({ ...baseInput, externalId: "V-3001" });
    await repository.create({ ...baseInput, externalId: "V-3002" });

    const result = await repository.list({ page: 1, limit: 10 });
    expect(result.data).toHaveLength(2);
    expect(result.meta.total).toBe(2);
  });

  it("computes summary totals and payment method breakdown", async () => {
    await repository.create({
      ...baseInput,
      externalId: "V-4001",
      amount: "100.00",
      paymentMethod: "efectivo",
      date: "2026-05-15",
    });
    await repository.create({
      ...baseInput,
      externalId: "V-4002",
      amount: "200.50",
      paymentMethod: "tarjeta",
      date: "2026-05-20",
    });

    const summary = await repository.getSummary("2026-05-01", "2026-05-31");

    expect(summary.count).toBe(2);
    expect(summary.totalAmount).toBe("300.50");
    expect(summary.byPaymentMethod.efectivo).toEqual({ count: 1, totalAmount: "100.00" });
    expect(summary.byPaymentMethod.tarjeta).toEqual({ count: 1, totalAmount: "200.50" });
    expect(summary.byPaymentMethod.transferencia).toEqual({ count: 0, totalAmount: "0.00" });
  });

  it("returns zeroed summary for empty date range", async () => {
    const summary = await repository.getSummary("2099-01-01", "2099-01-31");
    expect(summary.count).toBe(0);
    expect(summary.totalAmount).toBe("0.00");
    expect(summary.byPaymentMethod.transferencia.totalAmount).toBe("0.00");
  });

  it("finds multiple sales by external id", async () => {
    await repository.create(baseInput);
    await repository.create({ ...baseInput, externalId: "V-1002" });

    const found = repository.findByExternalIds(["V-1001", "V-1002", "V-9999"]);

    expect(found.size).toBe(2);
    expect(found.get("V-1001")?.externalId).toBe("V-1001");
    expect(found.get("V-1002")?.externalId).toBe("V-1002");
  });

  it("inserts many sales in one call", async () => {
    repository.insertMany([baseInput, { ...baseInput, externalId: "V-1002", amount: "200.00" }]);

    const first = await repository.findByExternalId("V-1001");
    const second = await repository.findByExternalId("V-1002");

    expect(first?.amount).toBe("18500.00");
    expect(second?.amount).toBe("200.00");
  });

  it("rolls back all writes when a transaction fails", async () => {
    await repository.create(baseInput);

    expect(() =>
      repository.runInTransaction((txRepo) => {
        txRepo.insertMany([{ ...baseInput, externalId: "V-2001" }]);
        txRepo.insertMany([{ ...baseInput, externalId: "V-1001" }]);
      })
    ).toThrow(ConflictError);

    expect(await repository.findByExternalId("V-2001")).toBeNull();
  });
});
