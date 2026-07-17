import { MulterError } from "multer";
import { ZodError } from "zod";
import { AppError } from "../../../../shared/errors/app.error";
import { ErrorCode } from "../../../../shared/errors/error-codes";
import { InternalError } from "../../../../shared/errors/internal.error";
import { ValidationError } from "../../../../shared/errors/validation.error";
import type { Logger } from "../../../../shared/logging/logger";
import type { HttpErrorHandler } from "../../http-request";

function toAppError(err: MulterError): AppError {
  if (err.code === "LIMIT_FILE_SIZE") {
    return new ValidationError("file too large");
  }

  return new ValidationError(err.message);
}

export function createErrorHandler(logger: Logger): HttpErrorHandler {
  return (err, req, res) => {
    const requestMeta = { method: req.method, path: req.path };

    if (err instanceof MulterError) {
      const appError = toAppError(err);
      logger.warn("Multipart error", {
        ...requestMeta,
        code: err.code,
        message: err.message,
      });
      res.status(appError.statusCode).json(appError.toJSON());
      return;
    }

    if (err instanceof AppError) {
      logger.warn("Application error", {
        ...requestMeta,
        code: err.code,
        status: err.statusCode,
        message: err.message,
      });
      res.status(err.statusCode).json(err.toJSON());
      return;
    }

    if (err instanceof ZodError) {
      logger.warn("Validation error", {
        ...requestMeta,
        issues: err.issues,
      });
      res.status(400).json({
        error: err.issues[0]?.message ?? "Validation failed",
        code: ErrorCode.VALIDATION_ERROR,
      });
      return;
    }

    logger.error("Unhandled error", { ...requestMeta, err });
    res.status(500).json(new InternalError().toJSON());
  };
}
