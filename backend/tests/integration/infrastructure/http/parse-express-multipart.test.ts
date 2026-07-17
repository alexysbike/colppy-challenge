import express from "express";
import request from "supertest";
import { parseExpressMultipart } from "../../../../src/infrastructure/http/express/multipart/parse-express-multipart";
import { createErrorHandler } from "../../../../src/infrastructure/http/express/middleware/error-handler.middleware";
import { wrapErrorHandler } from "../../../../src/infrastructure/http/express/middleware/async-handler.middleware";
import type { Logger } from "../../../../src/shared/logging/logger";

function buildUploadApp(maxFileSize?: number) {
  const logger: Logger = {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    child: jest.fn().mockReturnThis(),
  };

  const app = express();
  app.post("/upload", async (req, res, next) => {
    try {
      const file = await parseExpressMultipart(req, {
        field: "file",
        maxFileSize,
      });
      res.json({
        uploaded: Boolean(file),
        name: file?.originalname,
        content: file?.buffer.toString("utf-8"),
      });
    } catch (error) {
      next(error);
    }
  });
  app.use(wrapErrorHandler(createErrorHandler(logger)));
  return app;
}

describe("parseExpressMultipart", () => {
  it("parses uploaded file from multipart request", async () => {
    const app = buildUploadApp(1024 * 1024);
    const res = await request(app)
      .post("/upload")
      .attach("file", Buffer.from("id_venta,fecha\n"), "ventas.csv");

    expect(res.status).toBe(200);
    expect(res.body.uploaded).toBe(true);
    expect(res.body.name).toBe("ventas.csv");
    expect(res.body.content).toContain("id_venta");
  });

  it("returns uploaded false when no file is attached", async () => {
    const app = buildUploadApp();
    const res = await request(app).post("/upload");

    expect(res.status).toBe(200);
    expect(res.body.uploaded).toBe(false);
  });

  it("rejects files larger than maxFileSize", async () => {
    const app = buildUploadApp(50);
    const res = await request(app)
      .post("/upload")
      .attach("file", Buffer.alloc(200, "a"), "big.csv");

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("file too large");
  });
});
