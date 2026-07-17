import { useEffect, useMemo } from 'react'
import type { PeriodState } from '@/context'
import { useListSales } from '@/platform/api'
import type { ListSalesQuery } from '@/platform/api'

export const SALES_TABLE_PAGE_SIZE = 10

function periodToQuery(period: PeriodState, page: number): ListSalesQuery {
  return {
    from: period.from,
    to: period.to,
    page,
    limit: SALES_TABLE_PAGE_SIZE,
  }
}

export function useSalesListForPeriod(
  period: PeriodState,
  page: number,
  refreshKey = 0,
) {
  const query = useMemo(() => periodToQuery(period, page), [period, page])
  const list = useListSales(query, { autoCall: false })

  useEffect(() => {
    void list.call(undefined, { query })
  }, [list.call, query, refreshKey])

  return list
}
