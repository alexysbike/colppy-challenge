import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { SalesKpiCards } from '@/components/sales/SalesKpiCards'
import { summaryFixture } from '../../test-utils/mocks/sales.fixtures'
import { renderWithProviders } from '../../test-utils/render'

const useSalesSummaryForPeriod = vi.fn()
const useSalesSummary = vi.fn()

vi.mock('@/hooks/useSalesSummaryForPeriod', () => ({
  useSalesSummaryForPeriod: (...args: unknown[]) => useSalesSummaryForPeriod(...args),
}))

vi.mock('@/platform/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/platform/api')>()
  return {
    ...actual,
    useSalesSummary: (...args: unknown[]) => useSalesSummary(...args),
  }
})

describe('SalesKpiCards', () => {
  it('shows loading spinner', () => {
    useSalesSummaryForPeriod.mockReturnValue({
      data: undefined,
      loading: true,
      error: undefined,
    })
    useSalesSummary.mockReturnValue({
      call: vi.fn(),
      data: undefined,
      loading: false,
      error: undefined,
    })

    renderWithProviders(<SalesKpiCards />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('shows error message', () => {
    useSalesSummaryForPeriod.mockReturnValue({
      data: undefined,
      loading: false,
      error: { error: 'fail' },
    })
    useSalesSummary.mockReturnValue({
      call: vi.fn(),
      data: undefined,
      loading: false,
      error: undefined,
    })

    renderWithProviders(<SalesKpiCards />)
    expect(screen.getByText(/No se pudo cargar el resumen de ventas/)).toBeInTheDocument()
  })

  it('renders kpi cards with summary data', () => {
    useSalesSummaryForPeriod.mockReturnValue({
      data: summaryFixture,
      loading: false,
      error: undefined,
    })
    useSalesSummary.mockReturnValue({
      call: vi.fn(),
      data: {
        ...summaryFixture,
        totalAmount: '8000.00',
        count: 4,
      },
      loading: false,
      error: undefined,
    })

    renderWithProviders(<SalesKpiCards />)

    expect(screen.getByText('Total Ventas')).toBeInTheDocument()
    expect(screen.getByText('Ticket Promedio')).toBeInTheDocument()
    expect(screen.getByText('Transacciones')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('skips previous period query when range is incomplete', () => {
    useSalesSummaryForPeriod.mockReturnValue({
      data: summaryFixture,
      loading: false,
      error: undefined,
    })
    useSalesSummary.mockReturnValue({
      call: vi.fn(),
      data: undefined,
      loading: false,
      error: undefined,
    })

    renderWithProviders(<SalesKpiCards />)
    expect(useSalesSummary).toHaveBeenCalled()
  })
})
