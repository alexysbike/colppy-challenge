import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SalesDashboardHeader } from '@/components/sales/SalesDashboardHeader'
import { useAppContext } from '@/context'
import { renderWithProviders } from '../../test-utils/render'

vi.mock('@/components/sales/SalesDateRangePicker', () => ({
  SalesDateRangePicker: ({
    onChange,
  }: {
    onChange: (range: { from: Date; to: Date }) => void
  }) => (
    <button
      type="button"
      onClick={() =>
        onChange({
          from: new Date(2026, 5, 1),
          to: new Date(2026, 5, 30),
        })
      }
    >
      Cambiar rango
    </button>
  ),
}))

describe('SalesDashboardHeader', () => {
  it('renders header and action buttons', () => {
    renderWithProviders(
      <SalesDashboardHeader onCreateSale={vi.fn()} onImportCsv={vi.fn()} />,
    )

    expect(screen.getByText('Panel de Ventas')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cargar Venta' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Importar CSV' })).toBeInTheDocument()
  })

  it('updates period when date range changes', async () => {
    const user = userEvent.setup()
    let periodSnapshot: ReturnType<typeof useAppContext>['period'] | undefined

    function Probe() {
      periodSnapshot = useAppContext().period
      return null
    }

    renderWithProviders(
      <>
        <SalesDashboardHeader onCreateSale={vi.fn()} onImportCsv={vi.fn()} />
        <Probe />
      </>,
    )

    await user.click(screen.getByRole('button', { name: 'Cambiar rango' }))

    expect(periodSnapshot).toEqual({
      mode: 'range',
      from: '2026-06-01',
      to: '2026-06-30',
    })
  })

  it('calls action handlers', async () => {
    const user = userEvent.setup()
    const onCreateSale = vi.fn()
    const onImportCsv = vi.fn()

    renderWithProviders(
      <SalesDashboardHeader onCreateSale={onCreateSale} onImportCsv={onImportCsv} />,
    )

    await user.click(screen.getByRole('button', { name: 'Cargar Venta' }))
    await user.click(screen.getByRole('button', { name: 'Importar CSV' }))

    expect(onCreateSale).toHaveBeenCalled()
    expect(onImportCsv).toHaveBeenCalled()
  })
})
