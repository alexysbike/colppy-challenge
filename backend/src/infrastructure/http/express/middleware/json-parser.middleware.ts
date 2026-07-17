import type { HttpMiddleware } from "../../http-request";

export const jsonParserMiddleware: HttpMiddleware = (_req, _res, next) => {
  next();
};
