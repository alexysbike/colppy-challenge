import type { Response } from "express";
import type { HttpResponse } from "../../http-request";

export function adaptResponse(res: Response): HttpResponse {
  let statusCode = 200;

  return {
    status(code: number): HttpResponse {
      statusCode = code;
      res.status(code);
      return this;
    },
    json(body: unknown): void {
      res.status(statusCode).json(body);
    },
    send(): void {
      res.status(statusCode).send();
    },
  };
}
