export interface AnyObject {
  [k: string]: any
}

export interface HttpServiceConfig {
  baseUrl?: string
  headers?: AnyObject
  credentials?: string
}

export interface ExecuteOptions<T = AnyObject> {
  body?: T
  headers?: AnyObject
  asBlob?: boolean
}

export interface ExecuteResponse<T> {
  data: T | null | undefined
  statusCode: number
  headers: AnyObject
  error?: any
}

export const METHOD = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  PATCH: "PATCH",
  DELETE: "DELETE",
} as const

export type METHOD = (typeof METHOD)[keyof typeof METHOD]

export const defaultHttpServiceConfig: HttpServiceConfig = {
  headers: {
    'Content-Type': 'application/json',
  },
}

export abstract class HttpService {
  onSuccess?: <T = any>(response: ExecuteResponse<T>) => void | Promise<void>
  onError?: <T = any>(response: ExecuteResponse<T> | any) => void | Promise<void>
  preExecute?: <T = any>(method: METHOD, url: string, options?: ExecuteOptions<T>) => void | Promise<void>
  protected config: HttpServiceConfig

  constructor(initialConfig?: Partial<HttpServiceConfig>) {
    this.config = { ...defaultHttpServiceConfig, ...initialConfig }
  }

  get Headers() {
    return this.config.headers || {}
  }

  set Headers(headers: AnyObject) {
    this.config.headers = headers
  }

  async execute<T = any>(method: METHOD, url: string, options?: ExecuteOptions): Promise<ExecuteResponse<T>> {
    try {
      if (this.preExecute) {
        await this.preExecute(method, url, options)
      }

      const response = await this.doCall<T>(method, url, options)

      if (this.onSuccess) {
        await this.onSuccess(response)
      }

      return response
    } catch (e: any) {
      if (this.onError) {
        await this.onError(e)
      }

      throw e
    }
  }

  async get<T = any>(url: string, options?: ExecuteOptions) {
    return this.execute<T>(METHOD.GET, url, options)
  }

  async post<T = any>(url: string, body: AnyObject, options?: Omit<ExecuteOptions, 'body'>) {
    return this.execute<T>(METHOD.POST, url, options ? { ...options, body } : { body })
  }

  async put<T = any>(url: string, body: AnyObject, options?: Omit<ExecuteOptions, 'body'>) {
    return this.execute<T>(METHOD.PUT, url, options ? { ...options, body } : { body })
  }

  async patch<T = any>(url: string, body: AnyObject, options?: Omit<ExecuteOptions, 'body'>) {
    return this.execute<T>(METHOD.PATCH, url, options ? { ...options, body } : { body })
  }

  async delete<T = any>(url: string, body: AnyObject, options?: Omit<ExecuteOptions, 'body'>) {
    return this.execute<T>(METHOD.DELETE, url, options ? { ...options, body } : { body })
  }

  protected abstract doCall<T = any>(method: METHOD, url: string, options?: ExecuteOptions): Promise<ExecuteResponse<T>>
}
