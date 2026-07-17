import { amountToCents, centsToAmount, normalizeAmount } from "../../../src/shared/money";

describe("normalizeAmount", () => {
  it("formats to two decimal places", () => {
    expect(normalizeAmount("100")).toBe("100.00");
    expect(normalizeAmount("100.5")).toBe("100.50");
    expect(normalizeAmount("99.999")).toBe("100.00");
  });

  it("throws for invalid amounts", () => {
    expect(() => normalizeAmount("abc")).toThrow("Invalid amount");
    expect(() => normalizeAmount("NaN")).toThrow("Invalid amount");
  });

  it("treats empty string as zero", () => {
    expect(normalizeAmount("")).toBe("0.00");
  });
});

describe("amountToCents", () => {
  it("converts amount string to cents", () => {
    expect(amountToCents("10.50")).toBe(1050);
    expect(amountToCents("0.01")).toBe(1);
  });
});

describe("centsToAmount", () => {
  it("converts cents to amount string", () => {
    expect(centsToAmount(1050)).toBe("10.50");
    expect(centsToAmount(1)).toBe("0.01");
    expect(centsToAmount(0)).toBe("0.00");
  });
});

describe("round-trip conversion", () => {
  it("preserves value through cents conversion", () => {
    const amount = "1234.56";
    expect(centsToAmount(amountToCents(amount))).toBe(amount);
  });
});
