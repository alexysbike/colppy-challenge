import type { NextFunction, Request, Response } from "express";
import {
  asyncHandler,
  wrapErrorHandler,
  wrapMiddleware,
} from "../../../../../../src/infrastructure/http/express/middleware/async-handler.middleware";
import type {
  HttpErrorHandler,
  HttpMiddleware,
} from "../../../../../../src/infrastructure/http/http-request";

describe("async-handler middleware", () => {
  const req = { method: "GET", path: "/", params: {}, query: {}, body: {} } as Request;
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    send: jest.fn(),
  } as unknown as Response;
  const next = jest.fn() as NextFunction;

  beforeEach(() => jest.clearAllMocks());

  it("asyncHandler forwards rejected promises to next", async () => {
    const error = new Error("async failure");
    const handler = asyncHandler(async () => {
      throw error;
    });

    handler(req, res, next);
    await Promise.resolve();

    expect(next).toHaveBeenCalledWith(error);
  });

  it("asyncHandler does not call next on success", async () => {
    const handler = asyncHandler(async () => undefined);
    handler(req, res, next);
    await Promise.resolve();
    expect(next).not.toHaveBeenCalled();
  });

  it("wrapMiddleware adapts request/response and calls next", () => {
    const middleware: HttpMiddleware = jest.fn((_req, _res, done) => done());
    wrapMiddleware(middleware)(req, res, next);
    expect(middleware).toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it("wrapErrorHandler delegates to HttpErrorHandler", () => {
    const errorHandler: HttpErrorHandler = jest.fn();
    const error = new Error("handled");

    wrapErrorHandler(errorHandler)(error, req, res, next);

    expect(errorHandler).toHaveBeenCalledWith(
      error,
      expect.objectContaining({ method: "GET", path: "/" }),
      expect.any(Object)
    );
  });
});
