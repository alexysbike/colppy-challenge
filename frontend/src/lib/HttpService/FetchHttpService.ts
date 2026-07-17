import { type AnyObject, type ExecuteOptions, type ExecuteResponse, HttpService, METHOD } from './HttpService'

const getHeadersFromFetch = (header: any) => {
  const headers: AnyObject = {}
  header.forEach((value: any, key: string) => {
    headers[key] = value
  })
  return headers
}

export class FetchHttpService extends HttpService {
  async doCall<T>(method: METHOD, url: string, options?: ExecuteOptions): Promise<ExecuteResponse<T>> {
    let response: Response | undefined
    try {
      let body
      if (options?.body instanceof FormData) {
        body = options.body
      } else if (options?.body) {
        body = JSON.stringify(options.body)
      }

      const headers: AnyObject = options?.headers
        ? { ...this.config.headers, ...options.headers }
        : { ...this.config.headers }

      if (options?.body instanceof FormData) {
        for (const key of Object.keys(headers)) {
          if (key.toLowerCase() === 'content-type') {
            delete headers[key]
          }
        }
      }

      const request = {
        method,
        body,
        headers,
        ...(this.config.credentials ? { credentials: this.config.credentials as RequestCredentials } : {}),
      }

      response = await fetch(this.config.baseUrl + url, request)

      let data
      if (response.status < 200 || response.status >= 300) {
        data = await response.json()
        throw data
      } else {
        data = options?.asBlob ? await response.blob() : await response.text()
      }
      return {
        data: data && !options?.asBlob ? JSON.parse(data as string) : data,
        statusCode: response.status,
        headers: getHeadersFromFetch(response.headers),
      }
    } catch (e: any) {
      if (response) {
        throw {
          error: e,
          statusCode: response.status,
          headers: getHeadersFromFetch(response.headers),
        }
      }
      throw e
    }
  }
}
