import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { SalesTable } from '@/components/sales/SalesTable'
import { listSalesResponseFixture } from '../../test-utils/mocks/sales.fixtures'
import { renderWithProviders } from '../../test-utils/render'

const useSalesListForPeriod = vi.fn()

vi.mock('@/hooks/useSalesListForPeriod', () => ({
  useSalesListForPeriod: (...args: unknown[]) => useSalesListForPeriod(...args),
}))

describe('SalesTable', () => {
  it('shows loading spinner', () => {
    useSalesListForPeriod.mockReturnValue({
      data: undefined,
      loading: true,
      error: undefined,
    })

    renderWithProviders(<SalesTable />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('shows error message', () => {
    useSalesListForPeriod.mockReturnValue({
      data: undefined,
      loading: false,
      error: { error: 'fail' },
    })

    renderWithProviders(<SalesTable />)
    expect(screen.getByText(/No se pudieron cargar las ventas/)).toBeInTheDocument()
  })

  it('shows empty state', () => {
    useSalesListForPeriod.mockReturnValue({
      data: { data: [], meta: { page: 1, limit: 10, total: 0 } },
      loading: false,
      error: undefined,
    })

    renderWithProviders(<SalesTable />)
    expect(screen.getByText(/No hay ventas en este período/)).toBeInTheDocument()
  })

  it('renders sales rows and pagination', () => {
    useSalesListForPeriod.mockReturnValue({
      data: listSalesResponseFixture,
      loading: false,
      error: undefined,
    })

    renderWithProviders(<SalesTable />)

    expect(screen.getByText('Acme SA')).toBeInTheDocument()
    expect(screen.getByLabelText('Página anterior')).toBeInTheDocument()
  })

  it('resets page when period changes', () => {
    useSalesListForPeriod.mockReturnValue({
      data: listSalesResponseFixture,
      loading: false,
      error: undefined,
    })

    const { rerender } = renderWithProviders(<SalesTable />)
    expect(useSalesListForPeriod).toHaveBeenCalledWith(
      expect.objectContaining({ from: '2026-07-01' }),
      1,
      0,
    )

    rerender(<SalesTable refreshKey={1} />)
    expect(useSalesListForPeriod).toHaveBeenLastCalledWith(
      expect.any(Object),
      1,
      1,
    )
  })
})
