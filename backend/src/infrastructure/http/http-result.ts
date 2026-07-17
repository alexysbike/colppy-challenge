export class HttpResult {
  private constructor(
    readonly status: number,
    readonly body?: unknown
  ) {}

  static ok(body: unknown): HttpResult {
    return new HttpResult(200, body);
  }

  static created(body: unknown): HttpResult {
    return new HttpResult(201, body);
  }

  static noContent(): HttpResult {
    return new HttpResult(204);
  }

  static of(status: number, body?: unknown): HttpResult {
    return new HttpResult(status, body);
  }
}

export type RouteHandlerReturn = unknown | HttpResult | void;

export interface NormalizedHttpResult {
  status: number;
  body?: unknown;
}
