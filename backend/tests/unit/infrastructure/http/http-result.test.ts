import { HttpResult } from "../../../../src/infrastructure/http/http-result";

describe("HttpResult", () => {
  it("ok returns 200 with body", () => {
    const result = HttpResult.ok({ id: 1 });
    expect(result.status).toBe(200);
    expect(result.body).toEqual({ id: 1 });
  });

  it("created returns 201 with body", () => {
    const result = HttpResult.created({ id: 1 });
    expect(result.status).toBe(201);
    expect(result.body).toEqual({ id: 1 });
  });

  it("noContent returns 204 without body", () => {
    const result = HttpResult.noContent();
    expect(result.status).toBe(204);
    expect(result.body).toBeUndefined();
  });

  it("of allows custom status", () => {
    const result = HttpResult.of(202, { accepted: true });
    expect(result.status).toBe(202);
    expect(result.body).toEqual({ accepted: true });
  });
});
