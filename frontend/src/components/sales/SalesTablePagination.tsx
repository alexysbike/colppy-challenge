import { Button } from 'flowbite-react'
import { ChevronLeftIcon, ChevronRightIcon } from 'flowbite-react/icons'

interface SalesTablePaginationProps {
  page: number
  limit: number
  total: number
  onPageChange: (page: number) => void
}

export function SalesTablePagination({
  page,
  limit,
  total,
  onPageChange,
}: SalesTablePaginationProps) {
  const pageCount = Math.max(1, Math.ceil(total / limit))
  const showing = total === 0 ? 0 : Math.min(limit, total - (page - 1) * limit)

  return (
    <div className="flex flex-col gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-gray-500">
        Mostrando{' '}
        <span className="font-semibold text-gray-900">{showing}</span> de{' '}
        <span className="font-semibold text-gray-900">{total}</span> transacciones
      </p>

      <div className="flex items-center gap-2">
        <Button
          color="light"
          size="sm"
          className="!p-2"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Página anterior"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </Button>
        <p className="text-sm text-gray-500">
          Página{' '}
          <span className="font-semibold text-gray-900">{page}</span> de{' '}
          <span className="font-semibold text-gray-900">{pageCount}</span>
        </p>
        <Button
          color="light"
          size="sm"
          className="!p-2"
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
          aria-label="Página siguiente"
        >
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
