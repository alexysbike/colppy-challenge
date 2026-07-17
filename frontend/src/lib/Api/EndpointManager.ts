import { RESTEndpoint } from './RESTEndpoint';

export type RESTEndpointConstructor = new (path: string, options?: AnyObject) => RESTEndpoint
type AnyObject = { [key: string]: any }

export class EndpointManager {
  private endpoints = new Map<string, RESTEndpointConstructor>()
  private options = new Map<string, AnyObject>()

  register(path: string, RESTEndpointClass: RESTEndpointConstructor = RESTEndpoint, options: AnyObject = {}) {
    this.endpoints.set(path, RESTEndpointClass)
    this.options.set(path, options)
  }

  get(path: string): null | [RESTEndpointConstructor, AnyObject] {
    if (!this.endpoints.has(path)) {
      return null
    }
    return [this.endpoints.get(path) as RESTEndpointConstructor, this.options.get(path) as AnyObject]
  }
}
