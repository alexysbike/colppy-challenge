import { beforeEach, describe, expect, it, vi } from 'vitest'
import { FetchHttpService } from '@/lib/HttpService/FetchHttpService'
import { METHOD } from '@/lib/HttpService'

function mockResponse(
  status: number,
  body: string,
  headers: Record<string, string> = { 'content-type': 'application/json' },
) {
  return {
    status,
    headers: {
      forEach(callback: (value: string, key: string) => void) {
        for (const [key, value] of Object.entries(headers)) {
          callback(value, key)
        }
      },
    },
    json: vi.fn().mockResolvedValue(JSON.parse(body)),
    text: vi.fn().mockResolvedValue(body),
    blob: vi.fn().mockResolvedValue(new Blob([body])),
  }
}

describe('FetchHttpService', () => {
  let service: FetchHttpService

  beforeEach(() => {
    service = new FetchHttpService({ baseUrl: 'https://api.test' })
    vi.stubGlobal('fetch', vi.fn())
  })

  it('parses successful JSON responses', async () => {
    vi.mocked(fetch).mockResolvedValue(
      mockResponse(200, JSON.stringify({ ok: true })) as never,
    )

    const response = await service.execute(METHOD.GET, '/health')

    expect(fetch).toHaveBeenCalledWith('https://api.test/health', {
      method: METHOD.GET,
      body: undefined,
      headers: { 'Content-Type': 'application/json' },
    })
    expect(response.data).toEqual({ ok: true })
    expect(response.statusCode).toBe(200)
  })

  it('sends JSON body for POST requests', async () => {
    vi.mocked(fetch).mockResolvedValue(
      mockResponse(201, JSON.stringify({ id: 1 })) as never,
    )

    await service.execute(METHOD.POST, '/sales', {
      body: { customer: 'Acme' },
    })

    expect(fetch).toHaveBeenCalledWith('https://api.test/sales', {
      method: METHOD.POST,
      body: JSON.stringify({ customer: 'Acme' }),
      headers: { 'Content-Type': 'application/json' },
    })
  })

  it('sends FormData without forcing content-type', async () => {
    vi.mocked(fetch).mockResolvedValue(
      mockResponse(200, JSON.stringify({ created: 1 })) as never,
    )

    const formData = new FormData()
    formData.append('file', new File(['a'], 'sales.csv', { type: 'text/csv' }))

    await service.execute(METHOD.POST, '/sales/import', { body: formData })

    const [, request] = vi.mocked(fetch).mock.calls[0]
    expect(request.body).toBe(formData)
    expect(request.headers).not.toHaveProperty('Content-Type')
  })

  it('throws structured error for failed responses', async () => {
    vi.mocked(fetch).mockResolvedValue(
      mockResponse(409, JSON.stringify({ error: 'Conflict' })) as never,
    )

    await expect(service.execute(METHOD.POST, '/sales')).rejects.toMatchObject({
      error: { error: 'Conflict' },
      statusCode: 409,
    })
  })

  it('returns blob when asBlob is true', async () => {
    const blob = new Blob(['csv'])
    vi.mocked(fetch).mockResolvedValue({
      status: 200,
      headers: { forEach: () => {} },
      json: vi.fn(),
      text: vi.fn(),
      blob: vi.fn().mockResolvedValue(blob),
    } as never)

    const response = await service.execute(METHOD.GET, '/export', { asBlob: true })

    expect(response.data).toBe(blob)
  })
})
