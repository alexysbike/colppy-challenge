import { useEffect, useMemo } from 'react'
import { Spinner } from 'flowbite-react'
import { CartIcon, CashStackIcon, ReceiptIcon } from '@/components/icons'
import { KpiCard } from '@/components/ui/KpiCard'
import { useAppContext } from '@/context'
import { useSalesSummaryForPeriod } from '@/hooks/useSalesSummaryForPeriod'
import { formatCurrency, formatInteger } from '@/lib/formatters'
import {
  getAverageTicket,
  getPercentChange,
  getPreviousPeriod,
  trendFromChange,
} from '@/lib/salesMetrics'
import { useSalesSummary } from '@/platform/api'
import type { SalesSummaryQuery } from '@/platform/api'

function useSalesSummaryQuery(query: SalesSummaryQuery | null) {
  const summary = useSalesSummary(query ?? {}, { autoCall: false })

  useEffect(() => {
    if (!query) return
    void summary.call(undefined, { query })
  }, [summary.call, query])

  return summary
}

interface SalesKpiCardsProps {
  refreshKey?: number
}

export function SalesKpiCards({ refreshKey = 0 }: SalesKpiCardsProps) {
  const { period } = useAppContext()
  const { data, loading, error } = useSalesSummaryForPeriod(period, refreshKey)

  const previousQuery = useMemo((): SalesSummaryQuery | null => {
    if (!period.from || !period.to) return null
    return getPreviousPeriod(period.from, period.to)
  }, [period.from, period.to])

  const { data: previousData } = useSalesSummaryQuery(previousQuery)

  if (loading && !data) {
    return (
      <div className="flex justify-center py-10">
        <Spinner size="xl" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <p className="text-sm text-red-600">No se pudo cargar el resumen de ventas.</p>
    )
  }

  const avgTicket = getAverageTicket(data)

  const totalChange = previousData
    ? getPercentChange(Number(data.totalAmount), Number(previousData.totalAmount))
    : null
  const ticketChange = previousData
    ? getPercentChange(avgTicket, getAverageTicket(previousData))
    : null
  const countChange = previousData
    ? getPercentChange(data.count, previousData.count)
    : null

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <KpiCard
        title="Total Ventas"
        value={formatCurrency(data.totalAmount)}
        trend={trendFromChange(totalChange)}
        changePercent={totalChange}
        icon={CashStackIcon}
        underlineClassName="w-3/4"
      />
      <KpiCard
        title="Ticket Promedio"
        value={formatCurrency(avgTicket)}
        trend={trendFromChange(ticketChange)}
        changePercent={ticketChange}
        icon={ReceiptIcon}
        underlineClassName="w-1/2"
      />
      <KpiCard
        title="Transacciones"
        value={formatInteger(data.count)}
        trend={trendFromChange(countChange)}
        changePercent={countChange}
        icon={CartIcon}
        underlineClassName="w-[70%]"
      />
    </div>
  )
}
