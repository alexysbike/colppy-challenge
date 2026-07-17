import { useCallback } from 'react'
import { METHOD } from '@/lib/HttpService'
import { useApiCall } from '@/lib/Api'
import type { ImportSalesResult } from '../types'

const PATH = '/sales/import'

export function useImportSales() {
  const { call, ...rest } = useApiCall<ImportSalesResult>(
    METHOD.POST,
    PATH,
    {
      autoCall: false,
      throwError: false,
    },
  )

  const importFile = useCallback(
    (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      return call(formData as never)
    },
    [call],
  )

  return { importFile, ...rest }
}
