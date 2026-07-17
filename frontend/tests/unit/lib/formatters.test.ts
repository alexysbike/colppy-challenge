import { describe, expect, it } from 'vitest'
import { formatCurrency, formatInteger, formatSaleAmount } from '@/lib/formatters'

describe('formatters', () => {
  describe('formatCurrency', () => {
    it('formats numbers as ARS currency without decimals', () => {
      expect(formatCurrency(1500)).toMatch(/1\.?500/)
    })

    it('accepts string values', () => {
      expect(formatCurrency('2000')).toMatch(/2\.?000/)
    })
  })

  describe('formatSaleAmount', () => {
    it('formats amounts with two decimal places', () => {
      expect(formatSaleAmount(1500.5)).toMatch(/1\.?500,50|1\.?500\.50/)
    })
  })

  describe('formatInteger', () => {
    it('formats integers with locale separators', () => {
      expect(formatInteger(12345)).toMatch(/12\.?345/)
    })
  })
})
