import { resolve } from "path";
import { z } from "zod";

const nodeEnvSchema = z.enum(["development", "test", "production"]);

const logLevelSchema = z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]);

function defaultLogLevel(nodeEnv: z.infer<typeof nodeEnvSchema>): z.infer<typeof logLevelSchema> {
  if (nodeEnv === "test") {
    return "silent";
  }
  if (nodeEnv === "production") {
    return "info";
  }
  return "debug";
}

const envSchema = z
  .object({
    NODE_ENV: nodeEnvSchema.default("development"),
    PORT: z.coerce.number().int().min(1).max(65535).default(3000),
    DATABASE_PATH: z.string().min(1).default("./data/app.db"),
    LOG_LEVEL: logLevelSchema.optional(),
  })
  .transform((raw) => ({
    port: raw.PORT,
    databasePath: resolve(raw.DATABASE_PATH),
    nodeEnv: raw.NODE_ENV,
    isProduction: raw.NODE_ENV === "production",
    logLevel: raw.LOG_LEVEL ?? defaultLogLevel(raw.NODE_ENV),
  }));

export type Env = z.infer<typeof envSchema>;

export function loadEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid environment configuration:\n${details}`);
  }

  return result.data;
}
