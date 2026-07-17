import { mkdtempSync, rmSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { runMigrations } from "../../src/infrastructure/database/migrate";

export async function setupTestDb(): Promise<{ dbPath: string; cleanup: () => void }> {
  const dir = mkdtempSync(join(tmpdir(), "colppy-backend-test-"));
  const dbPath = join(dir, "test.db");
  await runMigrations(dbPath);

  return {
    dbPath,
    cleanup: () => rmSync(dir, { recursive: true, force: true }),
  };
}
