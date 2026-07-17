import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { HttpMiddleware, HttpErrorHandler } from "../../http-request";
import { adaptRequest } from "../adapters/express-request.adapter";
import { adaptResponse } from "../adapters/express-response.adapter";

export function wrapMiddleware(middleware: HttpMiddleware): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    middleware(adaptRequest(req), adaptResponse(res), next);
  };
}

export function asyncHandler(
  handler: (req: Request, res: Response) => Promise<void>
): RequestHandler {
  return (req, res, next) => {
    handler(req, res).catch(next);
  };
}

export function wrapErrorHandler(
  handler: HttpErrorHandler
): (err: unknown, req: Request, res: Response, next: NextFunction) => void {
  return (err, req, res, _next) => {
    handler(err, adaptRequest(req), adaptResponse(res));
  };
}
