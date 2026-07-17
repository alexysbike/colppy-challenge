import request from "supertest";
import { createTestApp } from "../../helpers/test-app";
import { setupTestDb } from "../../helpers/test-db";

describe("Sales validation", () => {
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

  it("returns 400 for invalid create sale payload", async () => {
    const res = await request(app).post("/sales").send({
      externalId: "INVALID",
      date: "not-a-date",
      customer: "",
      product: "",
      quantity: 0,
      amount: "0",
      paymentMethod: "crypto",
    });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe("VALIDATION_ERROR");
  });

  it("returns 409 when external id exists with different data", async () => {
    const payload = {
      externalId: "V-8001",
      date: "2026-05-10",
      customer: "Client A",
      product: "Product A",
      quantity: 1,
      amount: "100.00",
      paymentMethod: "efectivo",
    };

    await request(app).post("/sales").send(payload).expect(201);

    const conflict = await request(app)
      .post("/sales")
      .send({ ...payload, amount: "200.00" });

    expect(conflict.status).toBe(409);
    expect(conflict.body.code).toBe("CONFLICT");
  });

  it("returns 400 for summary without month or from/to", async () => {
    const res = await request(app).get("/sales/summary");
    expect(res.status).toBe(400);
    expect(res.body.code).toBe("VALIDATION_ERROR");
  });

  it("returns 400 for invalid month format", async () => {
    const res = await request(app).get("/sales/summary").query({ month: "2026-13" });
    expect(res.status).toBe(400);
  });

  it("returns 400 when month and from/to are both provided", async () => {
    const res = await request(app)
      .get("/sales/summary")
      .query({ month: "2026-05", from: "2026-05-01", to: "2026-05-31" });
    expect(res.status).toBe(400);
  });

  it("returns 400 for import without file", async () => {
    const res = await request(app).post("/sales/import");
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("file is required");
  });
});
