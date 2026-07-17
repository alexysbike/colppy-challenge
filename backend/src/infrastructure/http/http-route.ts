import { AppError } from "../../shared/errors/app.error";
import type { MultipartConfig } from "./multipart-config";
import { ErrorCode } from "../../shared/errors/error-codes";
import type { HttpRequest, HttpResponse } from "./http-request";
import { HttpMethod } from "./http-method";
import { HttpResult, type NormalizedHttpResult, type RouteHandlerReturn } from "./http-result";

const DEFAULT_STATUS_BY_METHOD: Record<HttpMethod, number> = {
  [HttpMethod.GET]: 200,
  [HttpMethod.POST]: 201,
  [HttpMethod.PUT]: 200,
  [HttpMethod.PATCH]: 200,
  [HttpMethod.DELETE]: 204,
};

export abstract class HttpRoute {
  abstract readonly path: string;
  abstract readonly methods: HttpMethod[];
  readonly multipart?: MultipartConfig;

  async execute(req: HttpRequest, res: HttpResponse): Promise<void> {
    if (!this.methods.includes(req.method)) {
      throw new AppError(`Method ${req.method} not allowed`, 405, ErrorCode.METHOD_NOT_ALLOWED);
    }

    const raw = await this.dispatch(req);
    const result = this.normalizeResult(req.method, raw);
    this.sendResult(res, result);
  }

  private async dispatch(req: HttpRequest): Promise<RouteHandlerReturn> {
    switch (req.method) {
      case HttpMethod.GET:
        return this.get(req);
      case HttpMethod.POST:
        return this.post(req);
      case HttpMethod.PUT:
        return this.put(req);
      case HttpMethod.PATCH:
        return this.patch(req);
      case HttpMethod.DELETE:
        return this.delete(req);
    }
  }

  private normalizeResult(method: HttpMethod, raw: RouteHandlerReturn): NormalizedHttpResult {
    if (raw instanceof HttpResult) {
      return { status: raw.status, body: raw.body };
    }

    const status = DEFAULT_STATUS_BY_METHOD[method];

    if (raw === undefined || raw === null) {
      return { status };
    }

    return { status, body: raw };
  }

  private sendResult(res: HttpResponse, result: NormalizedHttpResult): void {
    if (result.body === undefined) {
      res.status(result.status).send();
      return;
    }

    res.status(result.status).json(result.body);
  }

  protected get(_req: HttpRequest): Promise<RouteHandlerReturn> | RouteHandlerReturn {
    throw new AppError("GET not implemented", 405, ErrorCode.METHOD_NOT_ALLOWED);
  }

  protected post(_req: HttpRequest): Promise<RouteHandlerReturn> | RouteHandlerReturn {
    throw new AppError("POST not implemented", 405, ErrorCode.METHOD_NOT_ALLOWED);
  }

  protected put(_req: HttpRequest): Promise<RouteHandlerReturn> | RouteHandlerReturn {
    throw new AppError("PUT not implemented", 405, ErrorCode.METHOD_NOT_ALLOWED);
  }

  protected patch(_req: HttpRequest): Promise<RouteHandlerReturn> | RouteHandlerReturn {
    throw new AppError("PATCH not implemented", 405, ErrorCode.METHOD_NOT_ALLOWED);
  }

  protected delete(_req: HttpRequest): Promise<RouteHandlerReturn> | RouteHandlerReturn {
    throw new AppError("DELETE not implemented", 405, ErrorCode.METHOD_NOT_ALLOWED);
  }
}
