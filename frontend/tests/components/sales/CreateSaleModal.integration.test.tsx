import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CreateSaleModal } from '@/components/sales/CreateSaleModal'

const call = vi.fn()
const reset = vi.fn()

vi.mock('@/platform/api', () => ({
  PAYMENT_METHODS: ['transferencia', 'tarjeta', 'efectivo'],
  useCreateSale: () => ({
    call,
    loading: false,
    error: undefined,
    reset,
    statusCode: undefined,
  }),
}))

describe('CreateSaleModal integration', () => {
  beforeEach(() => {
    call.mockReset()
    reset.mockReset()
    call.mockResolvedValue({ data: { id: 1 }, statusCode: 201, headers: {} })
  })

  it('shows validation errors for empty form', async () => {
    const user = userEvent.setup()
    render(<CreateSaleModal open onClose={vi.fn()} onSuccess={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: 'Guardar Venta' }))

    expect(screen.getByText('El cliente es obligatorio.')).toBeInTheDocument()
    expect(call).not.toHaveBeenCalled()
  })

  it('submits valid sale', async () => {
    const user = userEvent.setup()
    const onSuccess = vi.fn()

    render(<CreateSaleModal open onClose={vi.fn()} onSuccess={onSuccess} />)

    await user.type(screen.getByLabelText(/ID DE VENTA/i), 'V-2000')
    await user.type(screen.getByLabelText(/CLIENTE/i), 'Beta Corp')
    await user.type(screen.getByLabelText(/PRODUCTO/i), 'Consultoría')
    await user.clear(screen.getByLabelText(/CANTIDAD/i))
    await user.type(screen.getByLabelText(/CANTIDAD/i), '3')
    await user.type(screen.getByLabelText(/MONTO/i), '2500')
    await user.click(screen.getByRole('button', { name: 'Guardar Venta' }))

    expect(call).toHaveBeenCalledWith(
      expect.objectContaining({
        externalId: 'V-2000',
        customer: 'Beta Corp',
        product: 'Consultoría',
        quantity: 3,
        amount: '2500.00',
      }),
    )
    expect(onSuccess).toHaveBeenCalled()
  })
})
