import type { Sale } from "../../../../src/domain/entities/sale";
import type { CreateSaleInput } from "../../../../src/domain/repositories/sale.repository.types";
import { normalizeSaleInput, saleMatchesInput } from "../../../../src/application/sales/sale-input";

const baseInput: CreateSaleInput = {
  externalId: " V-1001 ",
  date: "2026-05-02",
  customer: "  Cliente  ",
  product: "  Producto  ",
  quantity: 1,
  amount: "100.5",
  paymentMethod: "transferencia",
};

const baseSale: Sale = {
  id: 1,
  externalId: "V-1001",
  date: "2026-05-02",
  customer: "Cliente",
  product: "Producto",
  quantity: 1,
  amount: "100.50",
  paymentMethod: "transferencia",
  createdAt: "2026-05-01T00:00:00.000Z",
};

describe("normalizeSaleInput", () => {
  it("trims string fields and normalizes amount", () => {
    const normalized = normalizeSaleInput(baseInput);
    expect(normalized).toEqual({
      externalId: "V-1001",
      date: "2026-05-02",
      customer: "Cliente",
      product: "Producto",
      quantity: 1,
      amount: "100.50",
      paymentMethod: "transferencia",
    });
  });
});

describe("saleMatchesInput", () => {
  it("returns true when sale matches normalized input", () => {
    const input = normalizeSaleInput(baseInput);
    expect(saleMatchesInput(baseSale, input)).toBe(true);
  });

  it("returns false when amount differs", () => {
    const input = normalizeSaleInput({ ...baseInput, amount: "200.00" });
    expect(saleMatchesInput(baseSale, input)).toBe(false);
  });

  it("returns false when customer differs", () => {
    const input = normalizeSaleInput({ ...baseInput, customer: "Otro" });
    expect(saleMatchesInput(baseSale, input)).toBe(false);
  });

  it("returns false when payment method differs", () => {
    const input = normalizeSaleInput({ ...baseInput, paymentMethod: "efectivo" });
    expect(saleMatchesInput(baseSale, input)).toBe(false);
  });

  it("returns false when quantity differs", () => {
    const input = normalizeSaleInput({ ...baseInput, quantity: 2 });
    expect(saleMatchesInput(baseSale, input)).toBe(false);
  });
});
