import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SalesTablePagination } from '@/components/sales/SalesTablePagination'

describe('SalesTablePagination', () => {
  it('shows transaction count text', () => {
    render(
      <SalesTablePagination page={1} limit={10} total={25} onPageChange={vi.fn()} />,
    )

    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText('25')).toBeInTheDocument()
  })

  it('shows current page and total pages', () => {
    render(
      <SalesTablePagination page={2} limit={10} total={25} onPageChange={vi.fn()} />,
    )

    expect(screen.getByText(/Página/)).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('disables previous button on first page', () => {
    render(
      <SalesTablePagination page={1} limit={10} total={25} onPageChange={vi.fn()} />,
    )

    expect(screen.getByLabelText('Página anterior')).toBeDisabled()
  })

  it('disables next button on last page', () => {
    render(
      <SalesTablePagination page={3} limit={10} total={25} onPageChange={vi.fn()} />,
    )

    expect(screen.getByLabelText('Página siguiente')).toBeDisabled()
  })

  it('calls onPageChange when navigating', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()

    render(
      <SalesTablePagination page={2} limit={10} total={25} onPageChange={onPageChange} />,
    )

    await user.click(screen.getByLabelText('Página siguiente'))
    expect(onPageChange).toHaveBeenCalledWith(3)

    await user.click(screen.getByLabelText('Página anterior'))
    expect(onPageChange).toHaveBeenCalledWith(1)
  })
})
