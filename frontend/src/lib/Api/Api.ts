import { EndpointManager, type RESTEndpointConstructor } from './EndpointManager';
import { type AnyObject, HttpService, type HttpServiceConfig } from '../HttpService';
import { TokenManager } from './TokenManager'

export interface SessionConfiguration {
  name: string
  header: string
  tokenManager: TokenManager
}

export type HttpServiceConstructor = new (initialConfig?: Partial<HttpServiceConfig>) => HttpService

export abstract class Api {
  protected baseUrl: string
  protected options: Omit<HttpServiceConfig, 'baseUrl'>
  protected endpointManager = new EndpointManager()
  protected sessionTokens: Map<string, string> = new Map<string, string>()
  protected sessionConfigurationsMap: Map<string, SessionConfiguration> = new Map<string, SessionConfiguration>()

  constructor(baseUrl: string, options?: Omit<HttpServiceConfig, 'baseUrl'>) {
    this.baseUrl = baseUrl
    this.options = options || {}
    this.init()
  }

  protected _httpService?: HttpService

  get httpService() {
    if (!this._httpService) {
      throw new Error('Http Service not configured properly')
    }
    return this._httpService
  }

  set SessionConfiguration(configuration: SessionConfiguration[]) {
    this.sessionConfigurationsMap.clear()
    for (const config of configuration) {
      this.sessionConfigurationsMap.set(config.name, config)
    }
  }

  addSessionConfiguration(configuration: SessionConfiguration) {
    this.sessionConfigurationsMap.set(configuration.name, configuration)
    return this
  }

  async setSessionToken(tokens: Array<{ name: string; token: string }>) {
    for (const { name, token } of tokens) {
      const config = this.sessionConfigurationsMap.get(name)

      if (!config) {
        throw new Error(`Config for token session ${name} not found`)
      }

      await config.tokenManager.persist(name, token)
    }
    this.setSessionHeaders()
  }

  async addSessionToken(name: string, token: string) {
    const config = this.sessionConfigurationsMap.get(name)
    if (!config) {
      throw new Error(`Config for token session ${name} not found`)
    }
    await config.tokenManager.persist(name, token)
    this.setSessionHeaders()
  }

  async loadSessionTokens() {
    this.sessionTokens.clear()
    for (const config of this.sessionConfigurationsMap.values()) {
      const token = await config.tokenManager.retrieve(config.name)
      if (token) {
        this.sessionTokens.set(config.name, token)
      }
    }
    this.setSessionHeaders()
  }

  setSessionHeaders() {
    if (this._httpService) {
      const headers: AnyObject = { ...this._httpService.Headers }
      for (const config of this.sessionConfigurationsMap.values()) {
        const token = this.sessionTokens.get(config.name)
        if (token) {
          headers[config.header] = token
        } else {
          delete headers[config.header]
        }
      }
      this._httpService.Headers = headers
    }
  }

  async clearSessionTokens() {
    for (const config of this.sessionConfigurationsMap.values()) {
      await config.tokenManager.cleanAll()
    }

    this.sessionTokens.clear()
    this.setSessionHeaders()
  }

  async clearSessionToken(sessionName: string) {
    const config = this.sessionConfigurationsMap.get(sessionName)
    if (!config) {
      throw new Error(`Config for token session ${sessionName} not found`)
    }

    await config.tokenManager.clean(sessionName)
    this.sessionTokens.delete(sessionName)
    this.setSessionHeaders()
  }

  getEndpoint(path: string) {
    let endpointTuple = this.endpointManager.get(path)
    // This is to avoid unnecessary errors on unregistered paths
    if (!endpointTuple) {
      console.warn(
        `Registering missing endpoint path ${path}. Consider preregister the endpoint to increase performance`,
      )
      this.registerEndpoint(path)
      endpointTuple = this.endpointManager.get(path)
    }
    const [RESTEndpointConfigured, options] = endpointTuple as [RESTEndpointConstructor, AnyObject]
    const instance = new RESTEndpointConfigured(path, options)
    instance.httpService = this.httpService
    return instance
  }

  protected registerEndpoint(path: string, RESTEndpointClass?: RESTEndpointConstructor, options?: AnyObject) {
    this.endpointManager.register(path, RESTEndpointClass, options)
    return this
  }

  protected abstract getHttpService(): HttpServiceConstructor

  protected abstract config(): void

  /**
   * Checks response headers for any session tokens and saves them if found
   */
  protected checkResponseHeadersForSessionTokens(headers: AnyObject) {
    if (!headers) return

    for (const config of this.sessionConfigurationsMap.values()) {
      const token = headers[config.header]
      if (token) {
        // Found a token in the response headers, save it
        config.tokenManager.persist(config.name, token)
          .then(() => {
            this.sessionTokens.set(config.name, token)
            this.setSessionHeaders()
          })
          .catch(error => {
            console.error(`Failed to persist token for ${config.name}:`, error)
          })
      }
    }
  }

  private init() {
    const HttpConfiguredService = this.getHttpService()
    this._httpService = new HttpConfiguredService({ baseUrl: this.baseUrl, ...this.options })
    // this is to set the token before every request
    this._httpService.preExecute = () => this.loadSessionTokens()
    // check for session tokens in response headers after each successful execution
    this._httpService.onSuccess = (response) => {
      this.checkResponseHeadersForSessionTokens(response.headers)
    }
    // check for session tokens in response headers after each failed execution
    this._httpService.onError = (response) => {
      if (response && response.headers) {
        this.checkResponseHeadersForSessionTokens(response.headers)
      }

      // If it's a 403 error, clear all tokens
      if (response && response.statusCode === 403) {
        this.clearSessionTokens()
          .catch(error => {
            console.error('Failed to clear session tokens:', error)
          })
      }
    }
    this.config()
  }
}
