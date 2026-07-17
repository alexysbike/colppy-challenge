import type { Request } from "express";
import type { HttpRequest, UploadedFile } from "../../http-request";
import type { HttpMethod } from "../../http-method";

export interface AdaptRequestExtras {
  file?: UploadedFile;
}

export function adaptRequest(req: Request, extras?: AdaptRequestExtras): HttpRequest {
  const query: Record<string, string | string[] | undefined> = {};
  for (const [key, value] of Object.entries(req.query)) {
    if (value === undefined) continue;
    query[key] = Array.isArray(value) ? value.map(String) : String(value);
  }

  return {
    method: req.method as HttpMethod,
    path: req.path,
    params: req.params as Record<string, string>,
    query,
    body: req.body,
    file: extras?.file,
  };
}
