import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CustomerCell } from '@/components/sales/CustomerCell'

describe('CustomerCell', () => {
  it('renders customer name', () => {
    render(<CustomerCell customer="Acme SA" />)
    expect(screen.getByText('Acme SA')).toBeInTheDocument()
  })

  it('shows initials for two-word names', () => {
    render(<CustomerCell customer="Acme SA" />)
    expect(screen.getByText('AS')).toBeInTheDocument()
  })

  it('shows first two letters for single-word names', () => {
    render(<CustomerCell customer="Acme" />)
    expect(screen.getByText('AC')).toBeInTheDocument()
  })

  it('shows question mark for empty names', () => {
    render(<CustomerCell customer="   " />)
    expect(screen.getByText('?')).toBeInTheDocument()
  })
})
