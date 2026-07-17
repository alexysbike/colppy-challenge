import { METHOD } from '@/lib/HttpService'
import { useApiCall } from '@/lib/Api'
import type { CreateSaleInput, Sale } from '../types'

const PATH = '/sales'

export function useCreateSale() {
  return useApiCall<Sale, never, CreateSaleInput, never>(
    METHOD.POST,
    PATH,
    {
      autoCall: false,
      throwError: false,
    },
  )
}
