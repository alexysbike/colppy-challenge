import { copyFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const envPath = resolve("frontend/.env");
const examplePath = resolve("frontend/.env.example");

if (!existsSync(envPath)) {
  copyFileSync(examplePath, envPath);
  console.log("Created frontend/.env from frontend/.env.example");
} else {
  console.log("frontend/.env already exists — skipped");
}
