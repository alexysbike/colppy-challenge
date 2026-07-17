import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useCreateSaleForm } from '@/components/sales/hooks/useCreateSaleForm'

const call = vi.fn()
const reset = vi.fn()
let mockState = {
  loading: false,
  error: undefined as unknown,
  statusCode: undefined as number | undefined,
}

vi.mock('@/platform/api', () => ({
  useCreateSale: () => ({
    call,
    loading: mockState.loading,
    error: mockState.error,
    reset,
    statusCode: mockState.statusCode,
  }),
}))

describe('useCreateSaleForm', () => {
  beforeEach(() => {
    call.mockReset()
    reset.mockReset()
    mockState = { loading: false, error: undefined, statusCode: undefined }
    call.mockResolvedValue({ data: { id: 1 }, statusCode: 201, headers: {} })
  })

  it('validates required fields', async () => {
    const { result } = renderHook(() => useCreateSaleForm())

    await act(async () => {
      await result.current.submit()
    })

    expect(call).not.toHaveBeenCalled()
    expect(result.current.fieldErrors.customer).toBeTruthy()
    expect(result.current.fieldErrors.externalId).toBeTruthy()
    expect(result.current.fieldErrors.product).toBeTruthy()
  })

  it('validates external id format', async () => {
    const { result } = renderHook(() => useCreateSaleForm())

    act(() => {
      result.current.setField('externalId', 'INVALID')
      result.current.setField('customer', 'Acme SA')
      result.current.setField('product', 'Servicio')
      result.current.setField('quantity', '1')
      result.current.setField('amount', '100')
    })

    await act(async () => {
      await result.current.submit()
    })

    expect(call).not.toHaveBeenCalled()
    expect(result.current.fieldErrors.externalId).toContain('V-')
  })

  it('validates quantity and amount', async () => {
    const { result } = renderHook(() => useCreateSaleForm())

    act(() => {
      result.current.setField('externalId', 'V-1042')
      result.current.setField('customer', 'Acme SA')
      result.current.setField('product', 'Servicio')
      result.current.setField('quantity', '0')
      result.current.setField('amount', 'abc')
    })

    await act(async () => {
      await result.current.submit()
    })

    expect(call).not.toHaveBeenCalled()
    expect(result.current.fieldErrors.quantity).toBeTruthy()
    expect(result.current.fieldErrors.amount).toBeTruthy()
  })

  it('submits valid payload and resets on success', async () => {
    const onSuccess = vi.fn()
    const { result } = renderHook(() => useCreateSaleForm(onSuccess))

    act(() => {
      result.current.setField('externalId', 'V-1042')
      result.current.setField('customer', 'Acme SA')
      result.current.setField('product', 'Servicio')
      result.current.setField('quantity', '2')
      result.current.setField('amount', '1500,50')
      result.current.setField('paymentMethod', 'tarjeta')
    })

    await act(async () => {
      await result.current.submit()
    })

    expect(call).toHaveBeenCalledWith({
      externalId: 'V-1042',
      date: expect.any(String),
      customer: 'Acme SA',
      product: 'Servicio',
      quantity: 2,
      amount: '1500.50',
      paymentMethod: 'tarjeta',
    })
    expect(onSuccess).toHaveBeenCalled()
    expect(reset).toHaveBeenCalled()
    expect(result.current.fieldErrors).toEqual({})
  })

  it('does not call onSuccess when api returns error', async () => {
    call.mockResolvedValue({ error: { error: 'Server error' }, statusCode: 500 })
    const onSuccess = vi.fn()
    const { result } = renderHook(() => useCreateSaleForm(onSuccess))

    act(() => {
      result.current.setField('externalId', 'V-1042')
      result.current.setField('customer', 'Acme SA')
      result.current.setField('product', 'Servicio')
      result.current.setField('quantity', '1')
      result.current.setField('amount', '100')
    })

    await act(async () => {
      await result.current.submit()
    })

    expect(onSuccess).not.toHaveBeenCalled()
  })

  it('shows conflict message for 409 responses', () => {
    mockState.statusCode = 409
    const { result } = renderHook(() => useCreateSaleForm())
    expect(result.current.apiError).toContain('Ya existe una venta')
  })

  it('shows api error message from response', () => {
    mockState.error = { error: 'Error del servidor' }
    const { result } = renderHook(() => useCreateSaleForm())
    expect(result.current.apiError).toBe('Error del servidor')
  })

  it('resetForm clears values and api state', () => {
    const { result } = renderHook(() => useCreateSaleForm())

    act(() => {
      result.current.setField('customer', 'Acme SA')
      result.current.resetForm()
    })

    expect(reset).toHaveBeenCalled()
    expect(result.current.values.customer).toBe('')
  })
})
