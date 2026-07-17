export type PaymentMethod = "transferencia" | "tarjeta" | "efectivo";

export const PAYMENT_METHODS: readonly PaymentMethod[] = [
  "transferencia",
  "tarjeta",
  "efectivo",
] as const;

export interface Sale {
  id: number;
  externalId: string;
  date: string;
  customer: string;
  product: string;
  quantity: number;
  amount: string;
  paymentMethod: PaymentMethod;
  createdAt: string;
}
