import { existsSync, mkdtempSync, rmSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import Database from "better-sqlite3";
import { runMigrations } from "../../../../src/infrastructure/database/migrate";

describe("runMigrations", () => {
  it("creates database file and sales table", async () => {
    const dir = mkdtempSync(join(tmpdir(), "colppy-migrate-test-"));
    const dbPath = join(dir, "migrated.db");

    await runMigrations(dbPath);

    expect(existsSync(dbPath)).toBe(true);

    const sqlite = new Database(dbPath);
    const tables = sqlite
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='sales'")
      .all();
    sqlite.close();

    expect(tables).toHaveLength(1);
    rmSync(dir, { recursive: true, force: true });
  });
});
