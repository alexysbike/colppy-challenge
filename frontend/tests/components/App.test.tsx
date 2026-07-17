import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import App from '@/App'

vi.mock('@/screens/DashboardScreen', () => ({
  DashboardScreen: () => <div data-testid="dashboard-screen">Dashboard</div>,
}))

describe('App', () => {
  it('renders navbar and dashboard', () => {
    render(<App />)

    expect(screen.getByText('Ventas')).toBeInTheDocument()
    expect(screen.getByTestId('dashboard-screen')).toBeInTheDocument()
  })
})
