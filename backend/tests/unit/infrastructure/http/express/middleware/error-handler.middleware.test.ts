import { MulterError } from "multer";
import { z } from "zod";
import type { ZodError } from "zod";
import { createErrorHandler } from "../../../../../../src/infrastructure/http/express/middleware/error-handler.middleware";
import { ConflictError } from "../../../../../../src/shared/errors/conflict.error";
import { ErrorCode } from "../../../../../../src/shared/errors/error-codes";
import { InternalError } from "../../../../../../src/shared/errors/internal.error";
import { NotFoundError } from "../../../../../../src/shared/errors/not-found.error";
import { ValidationError } from "../../../../../../src/shared/errors/validation.error";
import type {
  HttpRequest,
  HttpResponse,
} from "../../../../../../src/infrastructure/http/http-request";
import type { Logger } from "../../../../../../src/shared/logging/logger";

function createContext() {
  const logger: Logger = {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    child: jest.fn().mockReturnThis(),
  };

  const res: HttpResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    send: jest.fn(),
  };

  const req: HttpRequest = {
    method: "POST",
    path: "/sales",
    params: {},
    query: {},
    body: {},
  };

  const handler = createErrorHandler(logger);
  return { handler, logger, req, res };
}

describe("createErrorHandler", () => {
  it("maps AppError to its status and json", () => {
    const { handler, req, res, logger } = createContext();
    const error = new ConflictError("Sale V-1 already exists");

    handler(error, req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      error: "Sale V-1 already exists",
      code: ErrorCode.CONFLICT,
    });
    expect(logger.warn).toHaveBeenCalled();
  });

  it("maps ValidationError to 400", () => {
    const { handler, req, res } = createContext();
    handler(new ValidationError("file is required"), req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("maps NotFoundError to 404", () => {
    const { handler, req, res } = createContext();
    handler(new NotFoundError(), req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("maps ZodError to 400 with first issue message", () => {
    const { handler, req, res } = createContext();
    const schema = z.object({ externalId: z.string().min(1) });
    let zodError: ZodError | undefined;
    try {
      schema.parse({ externalId: "" });
    } catch (err) {
      zodError = err as ZodError;
    }

    handler(zodError!, req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ code: ErrorCode.VALIDATION_ERROR })
    );
  });

  it("maps Multer LIMIT_FILE_SIZE to validation error", () => {
    const { handler, req, res } = createContext();
    const error = new MulterError("LIMIT_FILE_SIZE");

    handler(error, req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "file too large",
      code: ErrorCode.VALIDATION_ERROR,
    });
  });

  it("maps other MulterError using message", () => {
    const { handler, req, res } = createContext();
    const error = new MulterError("LIMIT_UNEXPECTED_FILE", "file");

    handler(error, req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ code: ErrorCode.VALIDATION_ERROR })
    );
  });

  it("maps unknown errors to 500 InternalError", () => {
    const { handler, req, res, logger } = createContext();

    handler(new Error("boom"), req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(new InternalError().toJSON());
    expect(logger.error).toHaveBeenCalled();
  });
});
