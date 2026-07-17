import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { SALES_TABLE_PAGE_SIZE, useSalesListForPeriod } from '@/hooks/useSalesListForPeriod'
import type { PeriodState } from '@/context'

const call = vi.fn().mockResolvedValue({ data: {}, statusCode: 200, headers: {} })

vi.mock('@/platform/api', () => ({
  useListSales: () => ({
    call,
    data: undefined,
    loading: false,
    error: undefined,
    reset: vi.fn(),
    statusCode: undefined,
    headers: undefined,
  }),
}))

describe('useSalesListForPeriod', () => {
  it('calls list endpoint with pagination', async () => {
    const period: PeriodState = {
      mode: 'range',
      from: '2026-07-01',
      to: '2026-07-31',
    }

    renderHook(() => useSalesListForPeriod(period, 2))

    await waitFor(() => {
      expect(call).toHaveBeenCalledWith(undefined, {
        query: {
          from: '2026-07-01',
          to: '2026-07-31',
          page: 2,
          limit: SALES_TABLE_PAGE_SIZE,
        },
      })
    })
  })
})
