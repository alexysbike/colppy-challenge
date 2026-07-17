import {
  amountSchema,
  createSaleSchema,
  externalIdSchema,
  isoDateSchema,
  listSalesQuerySchema,
  paymentMethodSchema,
  salesSummaryQuerySchema,
} from "../../../../src/presentation/validators/sale.schemas";

describe("isoDateSchema", () => {
  it("accepts valid iso dates", () => {
    expect(isoDateSchema.parse("2026-05-01")).toBe("2026-05-01");
  });

  it("rejects invalid dates", () => {
    expect(() => isoDateSchema.parse("05-01-2026")).toThrow();
  });
});

describe("externalIdSchema", () => {
  it("accepts V-<number> pattern", () => {
    expect(externalIdSchema.parse("V-1001")).toBe("V-1001");
  });

  it("rejects invalid patterns", () => {
    expect(() => externalIdSchema.parse("1001")).toThrow();
    expect(() => externalIdSchema.parse("V-abc")).toThrow();
  });
});

describe("amountSchema", () => {
  it("accepts positive decimals with up to 2 places", () => {
    expect(amountSchema.parse("100")).toBe("100");
    expect(amountSchema.parse("100.5")).toBe("100.5");
    expect(amountSchema.parse("100.50")).toBe("100.50");
  });

  it("rejects zero and negative amounts", () => {
    expect(() => amountSchema.parse("0")).toThrow();
    expect(() => amountSchema.parse("-10")).toThrow();
  });

  it("rejects more than 2 decimal places", () => {
    expect(() => amountSchema.parse("10.123")).toThrow();
  });
});

describe("paymentMethodSchema", () => {
  it("accepts valid payment methods", () => {
    expect(paymentMethodSchema.parse("transferencia")).toBe("transferencia");
    expect(paymentMethodSchema.parse("tarjeta")).toBe("tarjeta");
    expect(paymentMethodSchema.parse("efectivo")).toBe("efectivo");
  });

  it("rejects invalid payment methods", () => {
    expect(() => paymentMethodSchema.parse("crypto")).toThrow();
  });
});

describe("createSaleSchema", () => {
  const validPayload = {
    externalId: "V-1001",
    date: "2026-05-02",
    customer: "Cliente",
    product: "Producto",
    quantity: 1,
    amount: "100.00",
    paymentMethod: "transferencia",
  };

  it("parses valid payload", () => {
    expect(createSaleSchema.parse(validPayload)).toEqual(validPayload);
  });

  it("trims customer and product", () => {
    const parsed = createSaleSchema.parse({
      ...validPayload,
      customer: "  Cliente  ",
      product: "  Producto  ",
    });
    expect(parsed.customer).toBe("Cliente");
    expect(parsed.product).toBe("Producto");
  });

  it("rejects empty customer", () => {
    expect(() => createSaleSchema.parse({ ...validPayload, customer: "" })).toThrow();
  });
});

describe("listSalesQuerySchema", () => {
  it("applies defaults for page and limit", () => {
    expect(listSalesQuerySchema.parse({})).toEqual({ page: 1, limit: 20 });
  });

  it("coerces page and limit from strings", () => {
    expect(listSalesQuerySchema.parse({ page: "2", limit: "5" })).toEqual({
      page: 2,
      limit: 5,
    });
  });

  it("rejects limit above 100", () => {
    expect(() => listSalesQuerySchema.parse({ limit: 101 })).toThrow();
  });
});

describe("salesSummaryQuerySchema", () => {
  it("accepts month only", () => {
    expect(salesSummaryQuerySchema.parse({ month: "2026-05" })).toEqual({ month: "2026-05" });
  });

  it("accepts from and to", () => {
    expect(salesSummaryQuerySchema.parse({ from: "2026-05-01", to: "2026-05-31" })).toEqual({
      from: "2026-05-01",
      to: "2026-05-31",
    });
  });

  it("rejects month with from/to", () => {
    expect(() =>
      salesSummaryQuerySchema.parse({ month: "2026-05", from: "2026-05-01", to: "2026-05-31" })
    ).toThrow();
  });

  it("requires from and to when month is absent", () => {
    expect(() => salesSummaryQuerySchema.parse({ from: "2026-05-01" })).toThrow();
  });
});
