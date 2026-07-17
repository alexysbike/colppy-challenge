import type { ImportSalesResult, Sale, SalesSummary } from '@/platform/api'

export const saleFixture: Sale = {
  id: 1,
  externalId: 'V-1042',
  date: '2026-07-15',
  customer: 'Acme SA',
  product: 'Servicio contable',
  quantity: 1,
  amount: '1500.00',
  paymentMethod: 'efectivo',
}

export const summaryFixture: SalesSummary = {
  from: '2026-07-01',
  to: '2026-07-31',
  totalAmount: '10000.00',
  count: 5,
  byPaymentMethod: {
    efectivo: { count: 2, totalAmount: '4000.00' },
    tarjeta: { count: 2, totalAmount: '4000.00' },
    transferencia: { count: 1, totalAmount: '2000.00' },
  },
}

export const importResultFixture: ImportSalesResult = {
  created: 3,
  skipped: 1,
  failed: 1,
  errors: [
    { row: 4, externalId: 'V-999', error: 'Monto inválido' },
  ],
}

export const listSalesResponseFixture = {
  data: [saleFixture],
  meta: { page: 1, limit: 10, total: 1 },
}
