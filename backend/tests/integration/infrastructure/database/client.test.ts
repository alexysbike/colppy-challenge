import { closeDbClient, createDbClient } from "../../../../src/infrastructure/database/client";
import { sales } from "../../../../src/infrastructure/database/schema";
import { setupTestDb } from "../../../helpers/test-db";

describe("database client", () => {
  it("creates a client and allows basic queries after migration", async () => {
    const { dbPath, cleanup } = await setupTestDb();
    const db = createDbClient(dbPath);

    const rows = db.select().from(sales).all();
    expect(Array.isArray(rows)).toBe(true);

    closeDbClient(db);
    cleanup();
  });

  it("closes client without throwing", async () => {
    const { dbPath, cleanup } = await setupTestDb();
    const db = createDbClient(dbPath);
    expect(() => closeDbClient(db)).not.toThrow();
    cleanup();
  });
});
