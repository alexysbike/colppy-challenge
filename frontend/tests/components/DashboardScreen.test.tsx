import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { DashboardScreen } from '@/screens/DashboardScreen/DashboardScreen'
import { renderWithProviders } from '../test-utils/render'

vi.mock('@/components/sales/SalesKpiCards', () => ({
  SalesKpiCards: () => <div data-testid="kpi-cards" />,
}))

vi.mock('@/components/sales/SalesTable', () => ({
  SalesTable: () => <div data-testid="sales-table" />,
}))

vi.mock('@/components/sales/CreateSaleModal', () => ({
  CreateSaleModal: ({
    open,
    onClose,
    onSuccess,
  }: {
    open: boolean
    onClose: () => void
    onSuccess: () => void
  }) =>
    open ? (
      <div>
        <div>Create Sale Modal</div>
        <button onClick={onClose}>Close Create</button>
        <button onClick={onSuccess}>Success Create</button>
      </div>
    ) : null,
}))

vi.mock('@/components/sales/ImportCsvModal', () => ({
  ImportCsvModal: ({
    open,
    onClose,
    onSuccess,
  }: {
    open: boolean
    onClose: () => void
    onSuccess?: () => void
  }) =>
    open ? (
      <div>
        <div>Import CSV Modal</div>
        <button onClick={onClose}>Close Import</button>
        <button onClick={() => onSuccess?.()}>Success Import</button>
      </div>
    ) : null,
}))

describe('DashboardScreen', () => {
  it('renders dashboard sections', () => {
    renderWithProviders(<DashboardScreen />)

    expect(screen.getByText('Panel de Ventas')).toBeInTheDocument()
    expect(screen.getByTestId('kpi-cards')).toBeInTheDocument()
    expect(screen.getByTestId('sales-table')).toBeInTheDocument()
  })

  it('opens create sale modal', async () => {
    const user = userEvent.setup()
    renderWithProviders(<DashboardScreen />)

    await user.click(screen.getByRole('button', { name: 'Cargar Venta' }))
    expect(screen.getByText('Create Sale Modal')).toBeInTheDocument()
  })

  it('opens import csv modal', async () => {
    const user = userEvent.setup()
    renderWithProviders(<DashboardScreen />)

    await user.click(screen.getByRole('button', { name: 'Importar CSV' }))
    expect(screen.getByText('Import CSV Modal')).toBeInTheDocument()
  })

  it('refreshes data after creating a sale', async () => {
    const user = userEvent.setup()
    renderWithProviders(<DashboardScreen />)

    await user.click(screen.getByRole('button', { name: 'Cargar Venta' }))
    await user.click(screen.getByRole('button', { name: 'Success Create' }))

    expect(screen.queryByText('Create Sale Modal')).not.toBeInTheDocument()
  })

  it('refreshes data after importing csv', async () => {
    const user = userEvent.setup()
    renderWithProviders(<DashboardScreen />)

    await user.click(screen.getByRole('button', { name: 'Importar CSV' }))
    await user.click(screen.getByRole('button', { name: 'Success Import' }))

    expect(screen.getByText('Import CSV Modal')).toBeInTheDocument()
  })
})
