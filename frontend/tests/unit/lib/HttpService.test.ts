import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  HttpService,
  METHOD,
  type ExecuteOptions,
  type ExecuteResponse,
} from '@/lib/HttpService/HttpService'

class TestHttpService extends HttpService {
  doCall = vi.fn<[
    METHOD,
    string,
    ExecuteOptions | undefined,
  ], Promise<ExecuteResponse<unknown>>>()
}

describe('HttpService', () => {
  let service: TestHttpService

  beforeEach(() => {
    service = new TestHttpService({ baseUrl: 'https://api.test' })
    service.doCall.mockResolvedValue({
      data: { ok: true },
      statusCode: 200,
      headers: {},
    })
  })

  it('runs preExecute and onSuccess hooks', async () => {
    const preExecute = vi.fn()
    const onSuccess = vi.fn()
    service.preExecute = preExecute
    service.onSuccess = onSuccess

    await service.execute(METHOD.GET, '/health')

    expect(preExecute).toHaveBeenCalled()
    expect(onSuccess).toHaveBeenCalledWith({
      data: { ok: true },
      statusCode: 200,
      headers: {},
    })
  })

  it('runs onError hook and rethrows', async () => {
    const error = { statusCode: 500, error: 'fail' }
    service.doCall.mockRejectedValue(error)
    const onError = vi.fn()
    service.onError = onError

    await expect(service.get('/health')).rejects.toEqual(error)
    expect(onError).toHaveBeenCalledWith(error)
  })

  it('delegates HTTP verbs to execute', async () => {
    await service.post('/sales', { customer: 'Acme' })
    expect(service.doCall).toHaveBeenCalledWith(
      METHOD.POST,
      '/sales',
      expect.objectContaining({ body: { customer: 'Acme' } }),
    )

    await service.put('/sales/1', { customer: 'Beta' })
    expect(service.doCall).toHaveBeenCalledWith(
      METHOD.PUT,
      '/sales/1',
      expect.objectContaining({ body: { customer: 'Beta' } }),
    )

    await service.patch('/sales/1', { amount: '10' })
    expect(service.doCall).toHaveBeenCalledWith(
      METHOD.PATCH,
      '/sales/1',
      expect.objectContaining({ body: { amount: '10' } }),
    )

    await service.delete('/sales/1', {})
    expect(service.doCall).toHaveBeenCalledWith(
      METHOD.DELETE,
      '/sales/1',
      expect.objectContaining({ body: {} }),
    )
  })

  it('updates headers via getter and setter', () => {
    expect(service.Headers).toEqual({ 'Content-Type': 'application/json' })
    service.Headers = { Authorization: 'Bearer token' }
    expect(service.Headers).toEqual({ Authorization: 'Bearer token' })
  })
})
