import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CreateSaleModal } from '@/components/sales/CreateSaleModal'

const submit = vi.fn()
const resetForm = vi.fn()
const setField = vi.fn()

vi.mock('@/components/sales/hooks/useCreateSaleForm', () => ({
  useCreateSaleForm: (onSuccess?: () => void) => ({
    values: {
      externalId: '',
      customer: '',
      date: new Date(),
      product: '',
      quantity: '1',
      amount: '',
      paymentMethod: 'efectivo',
    },
    setField,
    fieldErrors: { customer: 'El cliente es obligatorio.' },
    apiError: 'Error del servidor',
    loading: false,
    submit: async () => {
      submit()
      onSuccess?.()
    },
    resetForm,
  }),
}))

describe('CreateSaleModal', () => {
  it('renders form fields when open', () => {
    render(
      <CreateSaleModal open onClose={vi.fn()} onSuccess={vi.fn()} />,
    )

    expect(screen.getByText('Cargar Venta Manual')).toBeInTheDocument()
    expect(screen.getByLabelText(/ID DE VENTA/i)).toBeInTheDocument()
    expect(screen.getByText('Error del servidor')).toBeInTheDocument()
    expect(screen.getByText('El cliente es obligatorio.')).toBeInTheDocument()
  })

  it('submits and closes via success callback', async () => {
    const user = userEvent.setup()
    const onSuccess = vi.fn()
    const onClose = vi.fn()

    render(
      <CreateSaleModal open onClose={onClose} onSuccess={onSuccess} />,
    )

    await user.click(screen.getByRole('button', { name: 'Guardar Venta' }))
    expect(submit).toHaveBeenCalled()
  })

  it('resets and closes on cancel', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    render(
      <CreateSaleModal open onClose={onClose} onSuccess={vi.fn()} />,
    )

    await user.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(resetForm).toHaveBeenCalled()
    expect(onClose).toHaveBeenCalled()
  })
})
