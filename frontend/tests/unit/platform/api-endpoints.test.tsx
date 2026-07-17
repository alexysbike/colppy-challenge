import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiContextProvider } from '@/lib/Api/react/context/ApiReactContext'
import { useApi } from '@/lib/Api/react/hooks/useApi'
import { useCreateSale } from '@/platform/api/endpoints/useCreateSale'
import { useHealth } from '@/platform/api/endpoints/useHealth'
import { useImportSales } from '@/platform/api/endpoints/useImportSales'
import { useListSales } from '@/platform/api/endpoints/useListSales'
import { useSalesSummary } from '@/platform/api/endpoints/useSalesSummary'
import { ColppyApi } from '@/platform/api/ColppyApi'

const execute = vi.fn()

vi.mock('@/lib/Api/react/hooks/useApiEndpoint', () => ({
  useApiEndpoint: () => ({
    execute,
  }),
}))

function wrapper({ children }: { children: ReactNode }) {
  return <ApiContextProvider api={ColppyApi}>{children}</ApiContextProvider>
}

describe('platform api endpoints', () => {
  beforeEach(() => {
    execute.mockResolvedValue({
      data: {},
      statusCode: 200,
      headers: {},
    })
  })

  it('useApi returns api context', () => {
    const { result } = renderHook(() => useApi(), { wrapper })
    expect(result.current.api).toBe(ColppyApi)
  })

  it('useHealth calls health endpoint', async () => {
    const { result } = renderHook(() => useHealth({ autoCall: false }), { wrapper })

    await result.current.call()
    expect(execute).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'GET' }),
    )
  })

  it('useListSales passes query params', async () => {
    const { result } = renderHook(
      () => useListSales({ from: '2026-07-01', to: '2026-07-31', page: 1 }, { autoCall: false }),
      { wrapper },
    )

    await result.current.call()
    expect(execute).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        query: { from: '2026-07-01', to: '2026-07-31', page: 1 },
      }),
    )
  })

  it('useSalesSummary passes query params', async () => {
    const { result } = renderHook(
      () => useSalesSummary({ month: '2026-07' }, { autoCall: false }),
      { wrapper },
    )

    await result.current.call()
    expect(execute).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        query: { month: '2026-07' },
      }),
    )
  })

  it('useCreateSale posts sale body', async () => {
    const { result } = renderHook(() => useCreateSale(), { wrapper })

    await result.current.call({
      externalId: 'V-1',
      date: '2026-07-01',
      customer: 'Acme',
      product: 'Servicio',
      quantity: 1,
      amount: '100.00',
      paymentMethod: 'efectivo',
    })

    expect(execute).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        body: expect.objectContaining({ externalId: 'V-1' }),
      }),
    )
  })

  it('useImportSales sends multipart form data', async () => {
    const { result } = renderHook(() => useImportSales(), { wrapper })
    const file = new File(['id'], 'sales.csv', { type: 'text/csv' })

    await result.current.importFile(file)

    expect(execute).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        body: expect.any(FormData),
      }),
    )
  })

  it('auto-calls list endpoint when enabled', async () => {
    renderHook(
      () => useListSales({ page: 1 }),
      { wrapper },
    )

    await waitFor(() => {
      expect(execute).toHaveBeenCalled()
    })
  })
})
