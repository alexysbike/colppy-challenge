import type { CreateSaleInput } from "../../domain/repositories/sale.repository.types";
import type { Sale } from "../../domain/entities/sale";
import { normalizeAmount } from "../../shared/money";

export { normalizeAmount } from "../../shared/money";

export function saleMatchesInput(sale: Sale, input: CreateSaleInput): boolean {
  return (
    sale.date === input.date &&
    sale.customer === input.customer &&
    sale.product === input.product &&
    sale.quantity === input.quantity &&
    sale.amount === normalizeAmount(input.amount) &&
    sale.paymentMethod === input.paymentMethod
  );
}

export function normalizeSaleInput(input: CreateSaleInput): CreateSaleInput {
  return {
    ...input,
    externalId: input.externalId.trim(),
    customer: input.customer.trim(),
    product: input.product.trim(),
    amount: normalizeAmount(input.amount),
  };
}
