import { useCallback, useEffect, useRef, useState } from 'react'

import { type AnyObject, type ExecuteResponse, METHOD} from '../../../HttpService'
import { type QueryObject, type RESTEndpointCallOptions } from '../../RESTEndpoint'
import { useApiEndpoint } from './useApiEndpoint'

export interface ApiCallOptions<Params = QueryObject, Body = AnyObject, Query = QueryObject>
  extends Omit<RESTEndpointCallOptions<Params, Body, Query>, 'method'> {
  autoCall?: boolean;
  throwError?: boolean;
}

export interface ApiCallReturn<T, Params = QueryObject, Body = AnyObject, Query = QueryObject> {
  data: T | null | undefined
  statusCode: number | undefined
  error?: any
  loading: boolean
  call: (body?: Body, opts?: Omit<ApiCallOptions<Params, Body, Query>, 'autoCall' | 'body'>) => Promise<ExecuteResponse<T>>
  reset: () => void
  headers: AnyObject | undefined
}

export const useApiCall = <
  T = any,
  Params extends QueryObject = QueryObject,
  Body extends AnyObject = AnyObject,
  Query extends QueryObject = QueryObject,
>(
    method: METHOD,
    path: string,
    options: ApiCallOptions<Params, Body, Query> = {},
  ): ApiCallReturn<T, Params, Body, Query> => {
  const ServiceEndpoint = useApiEndpoint(path)
  // Refs
  const queryOption = useRef<Query | undefined>(options.query)
  const paramsOption = useRef<Params | undefined>(options.params)
  const bodyOption = useRef<AnyObject | undefined>(options.body)
  const asBlobOption = useRef<boolean | undefined>(options.asBlob)
  const autoCallOption = useRef<boolean>(options.autoCall !== undefined ? options.autoCall : true)
  const throwErrorOption = useRef<boolean>(options.throwError !== undefined ? options.throwError : true)

  // Inner state
  const [data, setData] = useState<T | null | undefined>(undefined)
  const [error, setError] = useState<any>(undefined)
  const [loading, setLoading] = useState<boolean>(false)
  const [statusCode, setStatusCode] = useState<number | undefined>(undefined)
  const [headers, setHeaders] = useState<AnyObject | undefined>(undefined)

  const call = useCallback(
    async (body?: Body, opts: Omit<ApiCallOptions<Params, Body, Query>, 'autoCall'> = {}) => {
      const { query, params, asBlob, throwError, ...restOptions } = opts

      const throwErrorToUse = throwError !== undefined ? throwError : throwErrorOption.current;
      try {
        setLoading(true)

        const queryToUse = query || queryOption.current
        const paramsToUse = params || paramsOption.current
        const bodyToUse = body || bodyOption.current
        const asBlobToUse = asBlob || asBlobOption.current

        const response = await ServiceEndpoint.execute({
          query: queryToUse,
          params: paramsToUse,
          body: bodyToUse,
          asBlob: asBlobToUse,
          method,
          ...restOptions,
        })

        setError(undefined)
        setHeaders(response.headers)
        setData(response.data)
        setStatusCode(response.statusCode)

        return response;
      } catch (e: any) {
        setHeaders(e.headers)
        setData(undefined)
        setStatusCode(e.statusCode)
        setError(e.error)
        if (throwErrorToUse) {
          throw e
        } else {
          return e;
        }

      } finally {
        setLoading(false)
      }
    },
    [ServiceEndpoint, method],
  )

  const reset = useCallback(() => {
    setData(undefined)
    setStatusCode(undefined)
    setError(undefined)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (autoCallOption.current) {
      call()
    }
  }, [call])

  return { data, loading, error, call, reset, statusCode, headers }
}
/* prettier-ignore */
