import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useSalesSummaryForPeriod } from '@/hooks/useSalesSummaryForPeriod'
import type { PeriodState } from '@/context'

const call = vi.fn().mockResolvedValue({ data: {}, statusCode: 200, headers: {} })

vi.mock('@/platform/api', () => ({
  useSalesSummary: () => ({
    call,
    data: undefined,
    loading: false,
    error: undefined,
    reset: vi.fn(),
    statusCode: undefined,
    headers: undefined,
  }),
}))

describe('useSalesSummaryForPeriod', () => {
  it('calls summary endpoint with range query', async () => {
    const period: PeriodState = {
      mode: 'range',
      from: '2026-07-01',
      to: '2026-07-31',
    }

    renderHook(() => useSalesSummaryForPeriod(period))

    await waitFor(() => {
      expect(call).toHaveBeenCalledWith(undefined, {
        query: { from: '2026-07-01', to: '2026-07-31' },
      })
    })
  })

  it('calls summary endpoint with month query', async () => {
    const period: PeriodState = {
      mode: 'month',
      month: '2026-06',
    }

    renderHook(() => useSalesSummaryForPeriod(period))

    await waitFor(() => {
      expect(call).toHaveBeenCalledWith(undefined, {
        query: { month: '2026-06' },
      })
    })
  })
})
