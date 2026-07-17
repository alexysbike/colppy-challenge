import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

export type DbClient = ReturnType<typeof createDbClient>;

export function createDbClient(databasePath: string) {
  const sqlite = new Database(databasePath);
  sqlite.pragma("foreign_keys = ON");
  return drizzle(sqlite, { schema });
}

export function closeDbClient(db: DbClient): void {
  db.$client.close();
}
