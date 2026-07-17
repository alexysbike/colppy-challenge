import { describe, expect, it, vi } from 'vitest'
import { getQueryString, RESTEndpoint } from '@/lib/Api/RESTEndpoint'
import { METHOD } from '@/lib/HttpService'

describe('RESTEndpoint', () => {
  describe('getQueryString', () => {
    it('serializes query params', () => {
      expect(getQueryString({ from: '2026-07-01', to: '2026-07-31' })).toBe(
        'from=2026-07-01&to=2026-07-31',
      )
    })

    it('encodes special characters', () => {
      expect(getQueryString({ q: 'a b' })).toBe('q=a%20b')
    })
  })

  describe('getFullPathWithQuery', () => {
    it('returns path without query when empty', () => {
      const endpoint = new RESTEndpoint('/sales')
      expect(endpoint.getFullPathWithQuery()).toBe('/sales')
    })

    it('appends query string', () => {
      const endpoint = new RESTEndpoint('/sales')
      expect(endpoint.getFullPathWithQuery({ page: 1, limit: 10 })).toBe(
        '/sales?page=1&limit=10',
      )
    })

    it('replaces path params', () => {
      const endpoint = new RESTEndpoint('/sales/:id')
      expect(endpoint.getFullPathWithQuery({}, { id: 42 })).toBe('/sales/42')
    })
  })

  describe('execute', () => {
    it('delegates to http service', async () => {
      const endpoint = new RESTEndpoint<{ ok: boolean }>('/health')
      const execute = vi.fn().mockResolvedValue({
        data: { ok: true },
        statusCode: 200,
        headers: {},
      })
      endpoint.httpService = { execute } as never

      const response = await endpoint.execute({
        method: METHOD.GET,
        query: { verbose: 1 },
      })

      expect(execute).toHaveBeenCalledWith(METHOD.GET, '/health?verbose=1', {})
      expect(response.data).toEqual({ ok: true })
    })
  })
})
