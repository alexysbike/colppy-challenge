import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  formatDateInput,
  formatDateRangeLabel,
  getCurrentMonthRange,
  parseDateInput,
} from '@/lib/dates'

describe('dates', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 6, 16))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('parseDateInput', () => {
    it('parses yyyy-mm-dd into local date', () => {
      const date = parseDateInput('2026-07-15')
      expect(date.getFullYear()).toBe(2026)
      expect(date.getMonth()).toBe(6)
      expect(date.getDate()).toBe(15)
    })
  })

  describe('formatDateInput', () => {
    it('formats date as yyyy-mm-dd', () => {
      expect(formatDateInput(new Date(2026, 0, 5))).toBe('2026-01-05')
    })
  })

  describe('formatDateRangeLabel', () => {
    it('formats a date range label', () => {
      const label = formatDateRangeLabel(
        new Date(2026, 6, 1),
        new Date(2026, 6, 31),
      )
      expect(label).toContain('2026')
      expect(label).toContain('-')
    })
  })

  describe('getCurrentMonthRange', () => {
    it('returns first and last day of current month', () => {
      expect(getCurrentMonthRange()).toEqual({
        from: '2026-07-01',
        to: '2026-07-31',
      })
    })
  })
})
