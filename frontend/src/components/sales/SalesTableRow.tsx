import { TableCell, TableRow } from 'flowbite-react'
import type { Sale } from '@/platform/api'
import { formatSaleAmount } from '@/lib/formatters'
import { parseDateInput } from '@/lib/dates'
import { CustomerCell } from './CustomerCell'
import { PaymentMethodBadge } from './PaymentMethodBadge'

const dateFormatter = new Intl.DateTimeFormat('es-AR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

interface SalesTableRowProps {
  sale: Sale
}

export function SalesTableRow({ sale }: SalesTableRowProps) {
  return (
    <TableRow>
      <TableCell className="whitespace-nowrap">
        {dateFormatter.format(parseDateInput(sale.date))}
      </TableCell>
      <TableCell>
        <CustomerCell customer={sale.customer} />
      </TableCell>
      <TableCell>{sale.product}</TableCell>
      <TableCell className="text-right font-bold">
        {formatSaleAmount(sale.amount)}
      </TableCell>
      <TableCell>
        <PaymentMethodBadge method={sale.paymentMethod} />
      </TableCell>
    </TableRow>
  )
}
