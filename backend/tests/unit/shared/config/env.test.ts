import { resolve } from "path";
import { loadEnv } from "../../../../src/shared/config/env";

const ENV_KEYS = ["NODE_ENV", "PORT", "DATABASE_PATH", "LOG_LEVEL"] as const;

describe("loadEnv", () => {
  const originalEnv: Partial<Record<(typeof ENV_KEYS)[number], string | undefined>> = {};

  beforeEach(() => {
    for (const key of ENV_KEYS) {
      originalEnv[key] = process.env[key];
      delete process.env[key];
    }
  });

  afterEach(() => {
    for (const key of ENV_KEYS) {
      if (originalEnv[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = originalEnv[key];
      }
    }
  });

  it("uses defaults when env vars are missing", () => {
    const env = loadEnv();

    expect(env).toEqual({
      port: 3000,
      databasePath: resolve("./data/app.db"),
      nodeEnv: "development",
      isProduction: false,
      logLevel: "debug",
    });
  });

  it("parses valid overrides", () => {
    process.env.NODE_ENV = "production";
    process.env.PORT = "8080";
    process.env.DATABASE_PATH = "./custom/app.db";
    process.env.LOG_LEVEL = "warn";

    const env = loadEnv();

    expect(env).toEqual({
      port: 8080,
      databasePath: resolve("./custom/app.db"),
      nodeEnv: "production",
      isProduction: true,
      logLevel: "warn",
    });
  });

  it("defaults log level to silent in test", () => {
    process.env.NODE_ENV = "test";

    expect(loadEnv().logLevel).toBe("silent");
  });

  it("defaults log level to info in production", () => {
    process.env.NODE_ENV = "production";

    expect(loadEnv().logLevel).toBe("info");
  });

  it("throws when PORT is not a number", () => {
    process.env.PORT = "abc";

    expect(() => loadEnv()).toThrow(/Invalid environment configuration/);
  });

  it("throws when NODE_ENV is invalid", () => {
    process.env.NODE_ENV = "staging";

    expect(() => loadEnv()).toThrow(/Invalid environment configuration/);
  });

  it("throws when LOG_LEVEL is invalid", () => {
    process.env.LOG_LEVEL = "verbose";

    expect(() => loadEnv()).toThrow(/Invalid environment configuration/);
  });

  it("throws when DATABASE_PATH is empty", () => {
    process.env.DATABASE_PATH = "";

    expect(() => loadEnv()).toThrow(/Invalid environment configuration/);
  });
});
