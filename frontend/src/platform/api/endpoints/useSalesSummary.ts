import { METHOD } from '@/lib/HttpService'
import { useApiCall } from '@/lib/Api'
import type { SalesSummary, SalesSummaryQuery } from '../types'

const PATH = '/sales/summary'

export function useSalesSummary(
  query: SalesSummaryQuery,
  options?: { autoCall?: boolean },
) {
  return useApiCall<SalesSummary, never, never, SalesSummaryQuery>(
    METHOD.GET,
    PATH,
    {
      query,
      autoCall: options?.autoCall ?? true,
      throwError: false,
    },
  )
}
