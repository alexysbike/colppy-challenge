import type { Request, RequestHandler, Response } from "express";
import multer from "multer";
import type { MultipartConfig } from "../../multipart-config";
import type { UploadedFile } from "../../http-request";

function toUploadedFile(file: Express.Multer.File): UploadedFile {
  return {
    buffer: file.buffer,
    originalname: file.originalname,
    mimetype: file.mimetype,
  };
}

function runMulter(
  req: Request,
  middleware: RequestHandler
): Promise<Express.Multer.File | undefined> {
  return new Promise((resolve, reject) => {
    const res = {} as Response;

    middleware(req, res, (err: unknown) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(req.file);
    });
  });
}

const uploaders = new Map<string, ReturnType<typeof multer>>();

function getUploader(config: MultipartConfig): ReturnType<typeof multer> {
  const key = `${config.field}:${config.maxFileSize ?? "default"}`;

  if (!uploaders.has(key)) {
    uploaders.set(
      key,
      multer({
        storage: multer.memoryStorage(),
        limits: config.maxFileSize ? { fileSize: config.maxFileSize } : undefined,
      })
    );
  }

  return uploaders.get(key)!;
}

export async function parseExpressMultipart(
  req: Request,
  config: MultipartConfig
): Promise<UploadedFile | undefined> {
  const upload = getUploader(config);
  const file = await runMulter(req, upload.single(config.field));
  return file ? toUploadedFile(file) : undefined;
}
