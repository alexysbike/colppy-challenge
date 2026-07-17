import { useState } from 'react'
import {
  Card,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from 'flowbite-react'
import { useAppContext } from '@/context'
import { useSalesListForPeriod } from '@/hooks/useSalesListForPeriod'
import { SalesTableHeader } from './SalesTableHeader'
import { SalesTablePagination } from './SalesTablePagination'
import { SalesTableRow } from './SalesTableRow'

interface SalesTableProps {
  refreshKey?: number
}

export function SalesTable({ refreshKey = 0 }: SalesTableProps) {
  const { period } = useAppContext()
  const [page, setPage] = useState(1)
  const [prevPeriod, setPrevPeriod] = useState(period)

  if (prevPeriod.from !== period.from || prevPeriod.to !== period.to) {
    setPrevPeriod(period)
    setPage(1)
  }

  const { data, loading, error } = useSalesListForPeriod(period, page, refreshKey)
  const sales = data?.data ?? []
  const meta = data?.meta

  return (
    <Card className="border-gray-200 shadow-none">
      <SalesTableHeader />

      {loading && !data ? (
        <div className="flex justify-center py-10">
          <Spinner size="xl" />
        </div>
      ) : error ? (
        <p className="text-sm text-red-600">No se pudieron cargar las ventas.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <Table hoverable>
              <TableHead>
                <TableRow>
                  <TableHeadCell>FECHA</TableHeadCell>
                  <TableHeadCell>CLIENTE</TableHeadCell>
                  <TableHeadCell>CONCEPTO</TableHeadCell>
                  <TableHeadCell className="text-right">MONTO</TableHeadCell>
                  <TableHeadCell>MÉTODO DE PAGO</TableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-gray-500">
                      No hay ventas en este período.
                    </TableCell>
                  </TableRow>
                ) : (
                  sales.map((sale) => <SalesTableRow key={sale.id} sale={sale} />)
                )}
              </TableBody>
            </Table>
          </div>

          {meta ? (
            <SalesTablePagination
              page={meta.page}
              limit={meta.limit}
              total={meta.total}
              onPageChange={setPage}
            />
          ) : null}
        </>
      )}
    </Card>
  )
}
