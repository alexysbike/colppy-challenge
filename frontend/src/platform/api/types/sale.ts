export type PaymentMethod = 'transferencia' | 'tarjeta' | 'efectivo'

export const PAYMENT_METHODS = [
  'transferencia',
  'tarjeta',
  'efectivo',
] as const satisfies readonly PaymentMethod[]

export interface Sale {
  id: number
  externalId: string
  date: string
  customer: string
  product: string
  quantity: number
  amount: string
  paymentMethod: PaymentMethod
}

export interface CreateSaleInput {
  externalId: string
  date: string
  customer: string
  product: string
  quantity: number
  amount: string
  paymentMethod: PaymentMethod
}

export interface ListSalesQuery {
  from?: string
  to?: string
  page?: number
  limit?: number
  [key: string]: string | number | undefined
}

export interface SalesSummaryQuery {
  month?: string
  from?: string
  to?: string
  [key: string]: string | number | undefined
}

export interface PaymentMethodSummary {
  count: number
  totalAmount: string
}

export interface SalesSummary {
  from: string
  to: string
  totalAmount: string
  count: number
  byPaymentMethod: Record<PaymentMethod, PaymentMethodSummary>
}

export interface ImportRowError {
  row: number
  externalId?: string
  error: string
}

export interface ImportSalesResult {
  created: number
  skipped: number
  failed: number
  errors: ImportRowError[]
}
