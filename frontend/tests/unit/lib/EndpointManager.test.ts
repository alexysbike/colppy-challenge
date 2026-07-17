import { describe, expect, it } from 'vitest'
import { EndpointManager } from '@/lib/Api/EndpointManager'
import { RESTEndpoint } from '@/lib/Api/RESTEndpoint'

describe('EndpointManager', () => {
  it('registers and retrieves endpoints', () => {
    const manager = new EndpointManager()
    const options = { timeout: 1000 }

    manager.register('/sales', RESTEndpoint, options)

    expect(manager.get('/sales')).toEqual([RESTEndpoint, options])
    expect(manager.get('/missing')).toBeNull()
  })
})
