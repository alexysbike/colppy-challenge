import { METHOD } from '@/lib/HttpService'
import { useApiCall } from '@/lib/Api'
import type { ListSalesQuery, Sale } from '../types'
import type { PaginatedResponse } from '../types/pagination'

const PATH = '/sales'

export function useListSales(
  query: ListSalesQuery,
  options?: { autoCall?: boolean },
) {
  return useApiCall<PaginatedResponse<Sale>, never, never, ListSalesQuery>(
    METHOD.GET,
    PATH,
    {
      query,
      autoCall: options?.autoCall ?? true,
      throwError: false,
    },
  )
}
