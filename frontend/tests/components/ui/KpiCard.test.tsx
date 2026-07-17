import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { KpiCard } from '@/components/ui/KpiCard'
import { CartIcon } from '@/components/icons/CartIcon'

describe('KpiCard', () => {
  it('renders title and value', () => {
    render(
      <KpiCard
        title="Total Ventas"
        value="$ 10.000"
        icon={CartIcon}
      />,
    )

    expect(screen.getByText('Total Ventas')).toBeInTheDocument()
    expect(screen.getByText('$ 10.000')).toBeInTheDocument()
  })

  it('shows trend badge for positive change', () => {
    render(
      <KpiCard
        title="Total Ventas"
        value="$ 10.000"
        trend="up"
        changePercent={12.5}
        icon={CartIcon}
      />,
    )

    expect(screen.getByText('12.5%')).toBeInTheDocument()
  })

  it('shows trend badge for negative change', () => {
    render(
      <KpiCard
        title="Total Ventas"
        value="$ 10.000"
        trend="down"
        changePercent={-8}
        icon={CartIcon}
      />,
    )

    expect(screen.getByText('8%')).toBeInTheDocument()
  })

  it('hides trend badge when neutral', () => {
    render(
      <KpiCard
        title="Total Ventas"
        value="$ 10.000"
        trend="neutral"
        changePercent={0}
        icon={CartIcon}
      />,
    )

    expect(screen.queryByText('0%')).not.toBeInTheDocument()
  })
})
