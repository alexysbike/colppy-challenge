import { type AnyObject, type ExecuteOptions, HttpService, METHOD } from '../HttpService';

export type QueryObject = {
  [k: string]: string | number | undefined
}

export type OptionObject = {
  headers: AnyObject
}

export const getQueryString = (query: QueryObject) =>
  Object.entries(query)
    .map(([key, value]) => `${key}=${encodeURIComponent(value !== undefined ? value : '')}`)
    .join('&')

export interface RESTEndpointCallOptions<Params = QueryObject, Body = AnyObject, Query = QueryObject>
  extends ExecuteOptions<Body> {
  query?: Query
  params?: Params
  method: METHOD
}

export class RESTEndpoint<T = any> {
  protected path: string
  protected options: AnyObject

  constructor(path: string, options: AnyObject = {}) {
    this.path = path
    this.options = options
  }

  protected _httpService?: HttpService

  get httpService() {
    if (!this._httpService) {
      throw new Error('Http Service not set')
    }
    return this._httpService
  }

  set httpService(_httpService: HttpService) {
    this._httpService = _httpService
  }

  getFullPathWithQuery(query: QueryObject = {}, params: QueryObject = {}) {
    let url = this.path

    for (const [key, value] of Object.entries(params)) {
      if (!value) continue
      url = url.replace(`:${key}`, value.toString())
    }

    if (!Object.keys(query).length) {
      return url
    }

    return `${url}?${getQueryString(query)}`
  }

  async execute<S = T>({ query = {}, params = {}, method, ...restOptions }: RESTEndpointCallOptions) {
    return this.httpService.execute<S>(method, this.getFullPathWithQuery(query, params), restOptions)
  }
}
