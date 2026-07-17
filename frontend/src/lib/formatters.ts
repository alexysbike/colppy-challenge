const currencyFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
})

const saleAmountFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const integerFormatter = new Intl.NumberFormat('es-AR')

export function formatCurrency(value: number | string): string {
  return currencyFormatter.format(Number(value))
}

export function formatSaleAmount(value: number | string): string {
  return saleAmountFormatter.format(Number(value))
}

export function formatInteger(value: number): string {
  return integerFormatter.format(value)
}
