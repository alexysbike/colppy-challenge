import type { HttpMethod } from "./http-method";

export interface UploadedFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
}

export interface HttpRequest {
  method: HttpMethod;
  path: string;
  params: Record<string, string>;
  query: Record<string, string | string[] | undefined>;
  body: unknown;
  file?: UploadedFile;
}

export interface HttpResponse {
  status(code: number): HttpResponse;
  json(body: unknown): void;
  send(): void;
}

export interface HttpMiddleware {
  (req: HttpRequest, res: HttpResponse, next: () => void): void;
}

export interface HttpErrorHandler {
  (err: unknown, req: HttpRequest, res: HttpResponse): void;
}
