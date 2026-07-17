import { formatDateInput, parseDateInput } from '@/lib/dates'
import type { SalesSummary } from '@/platform/api'

export function getAverageTicket(summary: SalesSummary): number {
  if (summary.count === 0) return 0
  return Number(summary.totalAmount) / summary.count
}

export function getPreviousPeriod(from: string, to: string) {
  const start = parseDateInput(from)
  const end = parseDateInput(to)
  const days = Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1

  const prevEnd = new Date(start)
  prevEnd.setDate(prevEnd.getDate() - 1)

  const prevStart = new Date(prevEnd)
  prevStart.setDate(prevStart.getDate() - (days - 1))

  return {
    from: formatDateInput(prevStart),
    to: formatDateInput(prevEnd),
  }
}

export function getPercentChange(
  current: number,
  previous: number,
): number | null {
  if (previous === 0) {
    return current === 0 ? 0 : null
  }
  return ((current - previous) / previous) * 100
}

export type Trend = 'up' | 'down' | 'neutral'

export function trendFromChange(change: number | null): Trend {
  if (change == null || change === 0) return 'neutral'
  return change > 0 ? 'up' : 'down'
}
