import { AppError } from "../../../../src/shared/errors/app.error";
import { ConflictError } from "../../../../src/shared/errors/conflict.error";
import { ErrorCode } from "../../../../src/shared/errors/error-codes";
import { InternalError } from "../../../../src/shared/errors/internal.error";
import { NotFoundError } from "../../../../src/shared/errors/not-found.error";
import { ValidationError } from "../../../../src/shared/errors/validation.error";

describe("AppError", () => {
  it("exposes statusCode, code and toJSON", () => {
    const error = new AppError("custom", 418, ErrorCode.VALIDATION_ERROR);
    expect(error.statusCode).toBe(418);
    expect(error.code).toBe(ErrorCode.VALIDATION_ERROR);
    expect(error.toJSON()).toEqual({
      error: "custom",
      code: ErrorCode.VALIDATION_ERROR,
    });
  });
});

describe("ValidationError", () => {
  it("defaults to 400 VALIDATION_ERROR", () => {
    const error = new ValidationError("invalid");
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe(ErrorCode.VALIDATION_ERROR);
    expect(error.message).toBe("invalid");
  });
});

describe("ConflictError", () => {
  it("defaults to 409 CONFLICT", () => {
    const error = new ConflictError("duplicate");
    expect(error.statusCode).toBe(409);
    expect(error.code).toBe(ErrorCode.CONFLICT);
  });
});

describe("NotFoundError", () => {
  it("defaults to 404 NOT_FOUND", () => {
    const error = new NotFoundError();
    expect(error.statusCode).toBe(404);
    expect(error.code).toBe(ErrorCode.NOT_FOUND);
    expect(error.message).toBe("Resource not found");
  });
});

describe("InternalError", () => {
  it("defaults to 500 INTERNAL_ERROR", () => {
    const error = new InternalError();
    expect(error.statusCode).toBe(500);
    expect(error.code).toBe(ErrorCode.INTERNAL_ERROR);
    expect(error.toJSON()).toEqual({
      error: "Internal server error",
      code: ErrorCode.INTERNAL_ERROR,
    });
  });
});
