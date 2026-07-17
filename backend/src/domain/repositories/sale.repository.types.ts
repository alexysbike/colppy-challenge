import type { PaymentMethod, Sale } from "../entities/sale";

export interface CreateSaleInput {
  externalId: string;
  date: string;
  customer: string;
  product: string;
  quantity: number;
  amount: string;
  paymentMethod: PaymentMethod;
}

export interface SaleListFilters {
  from?: string;
  to?: string;
  page: number;
  limit: number;
}

export interface Paginated<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface PaymentMethodSummary {
  count: number;
  totalAmount: string;
}

export interface SalesSummary {
  from: string;
  to: string;
  totalAmount: string;
  count: number;
  byPaymentMethod: Record<PaymentMethod, PaymentMethodSummary>;
}

export interface SaleRepository {
  create(input: CreateSaleInput): Promise<Sale>;
  findByExternalId(externalId: string): Promise<Sale | null>;
  list(filters: SaleListFilters): Promise<Paginated<Sale>>;
  getSummary(from: string, to: string): Promise<SalesSummary>;
}
