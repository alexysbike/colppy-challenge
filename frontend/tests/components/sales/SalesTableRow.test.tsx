import { render, screen } from '@testing-library/react'
import { Table, TableBody } from 'flowbite-react'
import { describe, expect, it } from 'vitest'
import { SalesTableRow } from '@/components/sales/SalesTableRow'
import { saleFixture } from '../../test-utils/mocks/sales.fixtures'

describe('SalesTableRow', () => {
  it('renders sale data', () => {
    render(
      <Table hoverable>
        <TableBody>
          <SalesTableRow sale={saleFixture} />
        </TableBody>
      </Table>,
    )

    expect(screen.getByText('Acme SA')).toBeInTheDocument()
    expect(screen.getByText('Servicio contable')).toBeInTheDocument()
    expect(screen.getByText('Efectivo')).toBeInTheDocument()
  })
})
