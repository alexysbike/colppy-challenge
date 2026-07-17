import { describe, expect, it } from 'vitest'
import {
  getAverageTicket,
  getPercentChange,
  getPreviousPeriod,
  trendFromChange,
} from '@/lib/salesMetrics'
import { summaryFixture } from '../../test-utils/mocks/sales.fixtures'

describe('salesMetrics', () => {
  describe('getAverageTicket', () => {
    it('returns 0 when count is 0', () => {
      expect(getAverageTicket({ ...summaryFixture, count: 0 })).toBe(0)
    })

    it('calculates average ticket', () => {
      expect(getAverageTicket(summaryFixture)).toBe(2000)
    })
  })

  describe('getPreviousPeriod', () => {
    it('returns previous period with same length', () => {
      const previous = getPreviousPeriod('2026-07-10', '2026-07-16')
      expect(previous).toEqual({
        from: '2026-07-03',
        to: '2026-07-09',
      })
    })
  })

  describe('getPercentChange', () => {
    it('returns 0 when both values are 0', () => {
      expect(getPercentChange(0, 0)).toBe(0)
    })

    it('returns null when previous is 0 and current is not', () => {
      expect(getPercentChange(100, 0)).toBeNull()
    })

    it('calculates positive change', () => {
      expect(getPercentChange(150, 100)).toBe(50)
    })

    it('calculates negative change', () => {
      expect(getPercentChange(50, 100)).toBe(-50)
    })
  })

  describe('trendFromChange', () => {
    it('returns neutral for null or 0', () => {
      expect(trendFromChange(null)).toBe('neutral')
      expect(trendFromChange(0)).toBe('neutral')
    })

    it('returns up for positive change', () => {
      expect(trendFromChange(10)).toBe('up')
    })

    it('returns down for negative change', () => {
      expect(trendFromChange(-5)).toBe('down')
    })
  })
})
