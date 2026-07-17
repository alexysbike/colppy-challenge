import { existsSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { loadEnv } from "../../shared/config/env";
import { createLogger } from "../../infrastructure/logging/pino-logger";
import { closeDbClient, createDbClient } from "./client";

const MIGRATIONS_CANDIDATES = [
  join(process.cwd(), "dist/infrastructure/database/migrations"),
  join(process.cwd(), "src/infrastructure/database/migrations"),
];

function resolveMigrationsFolder(): string {
  for (const folder of MIGRATIONS_CANDIDATES) {
    if (existsSync(join(folder, "meta/_journal.json"))) {
      return folder;
    }
  }

  throw new Error(
    `Migrations not found. Expected meta/_journal.json in one of: ${MIGRATIONS_CANDIDATES.join(", ")}`
  );
}

export async function runMigrations(databasePath: string): Promise<void> {
  if (!databasePath.includes(":memory:") && !databasePath.startsWith("file:")) {
    mkdirSync(dirname(databasePath), { recursive: true });
  }
  const db = createDbClient(databasePath);
  try {
    migrate(db, { migrationsFolder: resolveMigrationsFolder() });
  } finally {
    closeDbClient(db);
  }
}

if (require.main === module) {
  const env = loadEnv();
  const { logger } = createLogger(env);
  runMigrations(env.databasePath)
    .then(() => logger.info("Migrations completed"))
    .catch((err) => logger.error("Migrations failed", { err }));
}
