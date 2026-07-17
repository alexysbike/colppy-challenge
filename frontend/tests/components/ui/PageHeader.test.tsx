import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PageHeader } from '@/components/ui/PageHeader'

describe('PageHeader', () => {
  it('renders title and description', () => {
    render(
      <PageHeader
        title="Panel de Ventas"
        description="Monitorea el crecimiento"
      />,
    )

    expect(screen.getByRole('heading', { name: 'Panel de Ventas' })).toBeInTheDocument()
    expect(screen.getByText('Monitorea el crecimiento')).toBeInTheDocument()
  })

  it('renders optional actions', () => {
    render(
      <PageHeader
        title="Panel"
        actions={<button type="button">Acción</button>}
      />,
    )

    expect(screen.getByRole('button', { name: 'Acción' })).toBeInTheDocument()
  })
})
