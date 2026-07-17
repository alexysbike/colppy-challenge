import pino, { type Logger as PinoLogger } from "pino";
import type { Env } from "../../shared/config/env";
import type { Logger } from "../../shared/logging/logger";

export interface LoggerBundle {
  logger: Logger;
  pino: PinoLogger;
}

function wrapPino(pinoLogger: PinoLogger): Logger {
  return {
    info(msg, meta) {
      pinoLogger.info(meta ?? {}, msg);
    },
    warn(msg, meta) {
      pinoLogger.warn(meta ?? {}, msg);
    },
    error(msg, meta) {
      pinoLogger.error(meta ?? {}, msg);
    },
    debug(msg, meta) {
      pinoLogger.debug(meta ?? {}, msg);
    },
    child(bindings) {
      return wrapPino(pinoLogger.child(bindings));
    },
  };
}

function createRootPino(env: Env): PinoLogger {
  const options: pino.LoggerOptions = {
    level: env.logLevel,
  };

  if (!env.isProduction && env.nodeEnv !== "test") {
    options.transport = {
      target: "pino-pretty",
      options: {
        colorize: true,
        singleLine: true,
        ignore: "pid,hostname",
      },
    };
  }

  return pino(options);
}

export function createLogger(env: Env): LoggerBundle {
  const root = createRootPino(env);
  return { logger: wrapPino(root), pino: root };
}
