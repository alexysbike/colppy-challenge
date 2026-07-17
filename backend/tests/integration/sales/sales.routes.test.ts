import { readFileSync } from "fs";
import { resolve } from "path";
import request from "supertest";
import { createTestApp } from "../../helpers/test-app";
import { setupTestDb } from "../../helpers/test-db";

describe("Sales routes", () => {
  let dbPath: string;
  let cleanup: () => void;
  let dispose: () => void;
  let app: Awaited<ReturnType<typeof createTestApp>>["app"];

  beforeAll(async () => {
    ({ dbPath, cleanup } = await setupTestDb());
    ({ app, dispose } = await createTestApp(dbPath));
  });

  afterAll(() => {
    dispose();
    cleanup();
  });

  it("imports sales from csv and returns summary", async () => {
    const csv = readFileSync(resolve(__dirname, "../../../fixtures/ventas_2026-05.csv"), "utf-8");

    const importResponse = await request(app)
      .post("/sales/import")
      .attach("file", Buffer.from(csv), "ventas_2026-05.csv");

    expect(importResponse.status).toBe(200);
    expect(importResponse.body.created).toBe(14);

    const listResponse = await request(app)
      .get("/sales")
      .query({ from: "2026-05-01", to: "2026-05-31" });
    expect(listResponse.status).toBe(200);
    expect(listResponse.body.data).toHaveLength(14);

    const summaryResponse = await request(app).get("/sales/summary").query({ month: "2026-05" });
    expect(summaryResponse.status).toBe(200);
    expect(summaryResponse.body.count).toBe(14);
    expect(summaryResponse.body.totalAmount).toBe("228234.56");
  });

  it("creates a sale and is idempotent", async () => {
    const payload = {
      externalId: "V-9001",
      date: "2026-05-10",
      customer: "Test Client",
      product: "Test Product",
      quantity: 1,
      amount: "100.00",
      paymentMethod: "efectivo",
    };

    const created = await request(app).post("/sales").send(payload);
    expect(created.status).toBe(201);

    const repeated = await request(app).post("/sales").send(payload);
    expect(repeated.status).toBe(200);
    expect(repeated.body.externalId).toBe("V-9001");
  });
});
