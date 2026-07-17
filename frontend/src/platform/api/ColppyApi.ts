import { Api } from '@/lib/Api'
import { FetchHttpService } from '@/lib/HttpService'
import { config } from '@/config/env'

class ColppyApiImpl extends Api {
  constructor() {
    super(config.apiBaseUrl, {
      headers: { 'Content-Type': 'application/json' },
    })
  }

  protected getHttpService() {
    return FetchHttpService
  }

  protected config(): void {
    this.registerEndpoint('/health')
    this.registerEndpoint('/sales')
    this.registerEndpoint('/sales/summary')
    this.registerEndpoint('/sales/import')
  }
}

export const ColppyApi = new ColppyApiImpl()
