import type { Request } from "express";
import { adaptRequest } from "../../../../../../src/infrastructure/http/express/adapters/express-request.adapter";

function mockExpressRequest(overrides: Partial<Request> = {}): Request {
  return {
    method: "GET",
    path: "/sales",
    params: { id: "1" },
    query: {},
    body: {},
    ...overrides,
  } as Request;
}

describe("adaptRequest", () => {
  it("maps method, path, params and body", () => {
    const req = mockExpressRequest({
      method: "POST",
      path: "/sales/import",
      params: { id: "42" },
      body: { externalId: "V-1" },
    });

    const adapted = adaptRequest(req);

    expect(adapted.method).toBe("POST");
    expect(adapted.path).toBe("/sales/import");
    expect(adapted.params).toEqual({ id: "42" });
    expect(adapted.body).toEqual({ externalId: "V-1" });
    expect(adapted.file).toBeUndefined();
  });

  it("stringifies scalar query values", () => {
    const req = mockExpressRequest({
      query: { from: "2026-05-01", page: "2" },
    });

    expect(adaptRequest(req).query).toEqual({
      from: "2026-05-01",
      page: "2",
    });
  });

  it("maps array query values to string arrays", () => {
    const req = mockExpressRequest({
      query: { tag: ["a", "b"] },
    });

    expect(adaptRequest(req).query).toEqual({
      tag: ["a", "b"],
    });
  });

  it("skips undefined query keys", () => {
    const req = mockExpressRequest({
      query: { from: "2026-05-01", to: undefined },
    });

    expect(adaptRequest(req).query).toEqual({ from: "2026-05-01" });
  });

  it("attaches uploaded file from extras", () => {
    const file = {
      buffer: Buffer.from("csv"),
      originalname: "ventas.csv",
      mimetype: "text/csv",
    };

    expect(adaptRequest(mockExpressRequest(), { file }).file).toEqual(file);
  });
});
