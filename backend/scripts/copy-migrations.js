const { cpSync, existsSync, mkdirSync } = require("fs");
const { dirname, join } = require("path");

const source = join(process.cwd(), "src/infrastructure/database/migrations");
const destination = join(process.cwd(), "dist/infrastructure/database/migrations");

if (!existsSync(join(source, "meta/_journal.json"))) {
  console.error(`Migrations source not found: ${source}`);
  process.exit(1);
}

mkdirSync(dirname(destination), { recursive: true });
cpSync(source, destination, { recursive: true });
console.log(`Copied migrations to ${destination}`);
