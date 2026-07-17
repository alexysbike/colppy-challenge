import { readFileSync } from "fs";
import { resolve } from "path";
import request from "supertest";
import { createTestApp } from "../../helpers/test-app";
import { setupTestDb } from "../../helpers/test-db";

describe("Sales import", () => {
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

  it("returns 400 for csv with invalid header", async () => {
    const csv = readFileSync(
      resolve(__dirname, "../../../fixtures/ventas-invalid-header.csv"),
      "utf-8"
    );

    const res = await request(app)
      .post("/sales/import")
      .attach("file", Buffer.from(csv), "ventas-invalid-header.csv");

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("Invalid CSV header");
  });

  it("imports valid rows and reports row errors for invalid ones", async () => {
    const csv = readFileSync(
      resolve(__dirname, "../../../fixtures/ventas-partial-errors.csv"),
      "utf-8"
    );

    const res = await request(app)
      .post("/sales/import")
      .attach("file", Buffer.from(csv), "ventas-partial-errors.csv");

    expect(res.status).toBe(200);
    expect(res.body.created).toBe(2);
    expect(res.body.failed).toBe(1);
    expect(res.body.errors).toHaveLength(1);
    expect(res.body.errors[0]?.externalId).toBe("INVALID");
  });

  it("imports csv with quoted fields", async () => {
    const csv = readFileSync(
      resolve(__dirname, "../../../fixtures/ventas-with-quotes.csv"),
      "utf-8"
    );

    const res = await request(app)
      .post("/sales/import")
      .attach("file", Buffer.from(csv), "ventas-with-quotes.csv");

    expect(res.status).toBe(200);
    expect(res.body.created).toBe(1);

    const list = await request(app).get("/sales").query({ from: "2026-05-01", to: "2026-05-31" });

    const imported = list.body.data.find(
      (sale: { externalId: string }) => sale.externalId === "V-6001"
    );
    expect(imported?.customer).toBe("Cliente, SA");
    expect(imported?.product).toBe("Producto, especial");
  });

  it("skips rows on re-import of same csv", async () => {
    const csv = readFileSync(resolve(__dirname, "../../../fixtures/ventas_2026-05.csv"), "utf-8");

    const first = await request(app)
      .post("/sales/import")
      .attach("file", Buffer.from(csv), "ventas_2026-05.csv");
    expect(first.body.created).toBe(2);

    const second = await request(app)
      .post("/sales/import")
      .attach("file", Buffer.from(csv), "ventas_2026-05.csv");
    expect(second.body.created).toBe(0);
    expect(second.body.skipped).toBe(2);
  });
});
