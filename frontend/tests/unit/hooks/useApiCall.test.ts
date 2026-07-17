import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { METHOD } from '@/lib/HttpService'
import { useApiCall } from '@/lib/Api/react/hooks/useApiCall'

const execute = vi.fn()

vi.mock('@/lib/Api/react/hooks/useApiEndpoint', () => ({
  useApiEndpoint: () => ({
    execute,
  }),
}))

describe('useApiCall', () => {
  beforeEach(() => {
    execute.mockReset()
    execute.mockResolvedValue({
      data: { ok: true },
      statusCode: 200,
      headers: {},
    })
  })

  it('auto-calls on mount by default', async () => {
    const { result } = renderHook(() =>
      useApiCall(METHOD.GET, '/health'),
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(execute).toHaveBeenCalled()
    expect(result.current.data).toEqual({ ok: true })
    expect(result.current.statusCode).toBe(200)
  })

  it('skips auto-call when disabled', async () => {
    renderHook(() =>
      useApiCall(METHOD.GET, '/health', { autoCall: false }),
    )

    await waitFor(() => {
      expect(execute).not.toHaveBeenCalled()
    })
  })

  it('handles errors without throwing when throwError is false', async () => {
    execute.mockRejectedValue({
      error: { error: 'fail' },
      statusCode: 500,
      headers: { 'x-request-id': '1' },
    })

    const { result } = renderHook(() =>
      useApiCall(METHOD.POST, '/sales', { autoCall: false, throwError: false }),
    )

    let response: Awaited<ReturnType<typeof result.current.call>> | undefined
    await act(async () => {
      response = await result.current.call({ customer: 'Acme' })
    })

    expect(response).toMatchObject({
      error: { error: 'fail' },
      statusCode: 500,
    })
    expect(result.current.error).toEqual({ error: 'fail' })
    expect(result.current.statusCode).toBe(500)
    expect(result.current.headers).toEqual({ 'x-request-id': '1' })
  })

  it('resets state', async () => {
    const { result } = renderHook(() =>
      useApiCall(METHOD.GET, '/health', { autoCall: false }),
    )

    await act(async () => {
      await result.current.call()
    })

    act(() => {
      result.current.reset()
    })

    expect(result.current.data).toBeUndefined()
    expect(result.current.error).toBeUndefined()
    expect(result.current.loading).toBe(false)
  })
})
