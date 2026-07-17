import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PaymentMethodBadge } from '@/components/sales/PaymentMethodBadge'

describe('PaymentMethodBadge', () => {
  it.each([
    ['efectivo', 'Efectivo'],
    ['tarjeta', 'Tarjeta'],
    ['transferencia', 'Transferencia'],
  ] as const)('renders %s label', (method, label) => {
    render(<PaymentMethodBadge method={method} />)
    expect(screen.getByText(label)).toBeInTheDocument()
  })
})
