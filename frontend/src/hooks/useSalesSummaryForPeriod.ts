import { useEffect, useMemo } from 'react'
import type { PeriodState } from '@/context'
import { useSalesSummary } from '@/platform/api'
import type { SalesSummaryQuery } from '@/platform/api'

function periodToQuery(period: PeriodState): SalesSummaryQuery {
  if (period.mode === 'month' && period.month) {
    return { month: period.month }
  }
  return { from: period.from, to: period.to }
}

export function useSalesSummaryForPeriod(period: PeriodState, refreshKey = 0) {
  const query = useMemo(() => periodToQuery(period), [period])
  const summary = useSalesSummary(query, { autoCall: false })

  useEffect(() => {
    void summary.call(undefined, { query })
  }, [summary.call, query, refreshKey])

  return summary
}
