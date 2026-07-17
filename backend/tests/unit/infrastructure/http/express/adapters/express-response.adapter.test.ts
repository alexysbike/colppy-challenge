import type { Response } from "express";
import { adaptResponse } from "../../../../../../src/infrastructure/http/express/adapters/express-response.adapter";

function mockExpressResponse(): Response {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    send: jest.fn(),
  } as unknown as Response;
}

describe("adaptResponse", () => {
  it("json sets status then body", () => {
    const res = mockExpressResponse();
    const httpRes = adaptResponse(res);

    httpRes.status(201).json({ id: 1 });

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ id: 1 });
  });

  it("send uses last status code", () => {
    const res = mockExpressResponse();
    const httpRes = adaptResponse(res);

    httpRes.status(204).send();

    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });

  it("defaults to 200 when json without explicit status", () => {
    const res = mockExpressResponse();
    adaptResponse(res).json({ ok: true });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ ok: true });
  });

  it("status is chainable", () => {
    const httpRes = adaptResponse(mockExpressResponse());
    expect(httpRes.status(404)).toBe(httpRes);
  });
});
