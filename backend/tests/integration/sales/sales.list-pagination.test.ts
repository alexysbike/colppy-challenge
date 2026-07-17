import request from "supertest";
import { createTestApp } from "../../helpers/test-app";
import { setupTestDb } from "../../helpers/test-db";

describe("Health route", () => {
  let cleanup: () => void;
  let dispose: () => void;
  let app: Awaited<ReturnType<typeof createTestApp>>["app"];

  beforeAll(async () => {
    const { dbPath, cleanup: dbCleanup } = await setupTestDb();
    cleanup = dbCleanup;
    ({ app, dispose } = await createTestApp(dbPath));
  });

  afterAll(() => {
    dispose();
    cleanup();
  });

  it("returns ok status", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});

describe("Sales list and pagination", () => {
  let cleanup: () => void;
  let dispose: () => void;
  let app: Awaited<ReturnType<typeof createTestApp>>["app"];

  beforeAll(async () => {
    const { dbPath, cleanup: dbCleanup } = await setupTestDb();
    cleanup = dbCleanup;
    ({ app, dispose } = await createTestApp(dbPath));
  });

  afterAll(() => {
    dispose();
    cleanup();
  });

  beforeEach(async () => {
    for (let i = 1; i <= 3; i += 1) {
      await request(app)
        .post("/sales")
        .send({
          externalId: `V-7${String(i).padStart(3, "0")}`,
          date: `2026-05-0${i}`,
          customer: `Client ${i}`,
          product: "Product",
          quantity: 1,
          amount: `${i * 10}.00`,
          paymentMethod: "efectivo",
        });
    }
  });

  it("paginates sales list", async () => {
    const page1 = await request(app)
      .get("/sales")
      .query({ from: "2026-05-01", to: "2026-05-31", page: 1, limit: 2 });

    expect(page1.status).toBe(200);
    expect(page1.body.data).toHaveLength(2);
    expect(page1.body.meta).toEqual({ page: 1, limit: 2, total: 3 });

    const page2 = await request(app)
      .get("/sales")
      .query({ from: "2026-05-01", to: "2026-05-31", page: 2, limit: 2 });

    expect(page2.body.data).toHaveLength(1);
    expect(page2.body.meta.total).toBe(3);
  });

  it("filters sales by date range", async () => {
    const res = await request(app).get("/sales").query({ from: "2026-05-01", to: "2026-05-01" });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0]?.externalId).toBe("V-7001");
  });

  it("returns summary by from/to range", async () => {
    const res = await request(app)
      .get("/sales/summary")
      .query({ from: "2026-05-01", to: "2026-05-31" });

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(3);
    expect(res.body.totalAmount).toBe("60.00");
  });
});
