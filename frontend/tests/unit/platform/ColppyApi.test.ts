import { describe, expect, it, vi } from 'vitest'
import { ColppyApi } from '@/platform/api/ColppyApi'
import { RESTEndpoint } from '@/lib/Api/RESTEndpoint'

describe('ColppyApi', () => {
  it('registers sales endpoints', () => {
    const health = ColppyApi.getEndpoint('/health')
    const sales = ColppyApi.getEndpoint('/sales')
    const summary = ColppyApi.getEndpoint('/sales/summary')
    const importEndpoint = ColppyApi.getEndpoint('/sales/import')

    expect(health).toBeInstanceOf(RESTEndpoint)
    expect(sales).toBeInstanceOf(RESTEndpoint)
    expect(summary).toBeInstanceOf(RESTEndpoint)
    expect(importEndpoint).toBeInstanceOf(RESTEndpoint)
  })

  it('warns and auto-registers unknown endpoints', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const endpoint = ColppyApi.getEndpoint('/unknown')

    expect(warn).toHaveBeenCalled()
    expect(endpoint).toBeInstanceOf(RESTEndpoint)
    warn.mockRestore()
  })
})
