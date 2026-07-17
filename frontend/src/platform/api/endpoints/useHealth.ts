import { METHOD } from '@/lib/HttpService'
import { useApiCall } from '@/lib/Api'

const PATH = '/health'

export interface HealthResponse {
  status: 'ok'
}

export function useHealth(options?: { autoCall?: boolean }) {
  return useApiCall<HealthResponse>(METHOD.GET, PATH, {
    autoCall: options?.autoCall ?? true,
    throwError: false,
  })
}
