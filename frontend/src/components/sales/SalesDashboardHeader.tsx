import { PageHeader } from '@/components/ui'
import { useAppContext } from '@/context'
import { formatDateInput, getCurrentMonthRange, parseDateInput } from '@/lib/dates'
import { CreateSaleButton } from './CreateSaleButton'
import { ImportCsvButton } from './ImportCsvButton'
import { SalesDateRangePicker } from './SalesDateRangePicker'

interface SalesDashboardHeaderProps {
  onCreateSale: () => void
  onImportCsv: () => void
}

export function SalesDashboardHeader({ onCreateSale, onImportCsv }: SalesDashboardHeaderProps) {
  const { period, setPeriod } = useAppContext()

  const { from: defaultFrom, to: defaultTo } = getCurrentMonthRange()
  const from = parseDateInput(period.from ?? defaultFrom)
  const to = parseDateInput(period.to ?? defaultTo)

  return (
    <PageHeader
      title="Panel de Ventas"
      description="Monitorea el crecimiento y rendimiento de tu PyME en tiempo real."
      actions={
        <>
          <SalesDateRangePicker
            from={from}
            to={to}
            onChange={({ from: nextFrom, to: nextTo }) => {
              setPeriod({
                mode: 'range',
                from: formatDateInput(nextFrom),
                to: formatDateInput(nextTo),
              })
            }}
          />
          <ImportCsvButton onClick={onImportCsv} />
          <CreateSaleButton onClick={onCreateSale} />
        </>
      }
    />
  )
}
