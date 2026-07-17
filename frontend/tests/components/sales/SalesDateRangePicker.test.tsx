import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SalesDateRangePicker } from '@/components/sales/SalesDateRangePicker'

describe('SalesDateRangePicker', () => {
  it('renders formatted range label', () => {
    render(
      <SalesDateRangePicker
        from={new Date(2026, 6, 1)}
        to={new Date(2026, 6, 31)}
        onChange={vi.fn()}
      />,
    )

    expect(screen.getByRole('button')).toHaveTextContent('2026')
  })

  it('opens dropdown with date pickers', async () => {
    const user = userEvent.setup()

    render(
      <SalesDateRangePicker
        from={new Date(2026, 6, 1)}
        to={new Date(2026, 6, 31)}
        onChange={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button'))
    expect(screen.getByLabelText('Desde')).toBeInTheDocument()
    expect(screen.getByLabelText('Hasta')).toBeInTheDocument()
  })
})
