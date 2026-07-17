import type { ComponentType, SVGProps } from 'react'
import { Badge, Card } from 'flowbite-react'
import { ChevronDownIcon, ChevronUpIcon } from 'flowbite-react/icons'
import type { Trend } from '@/lib/salesMetrics'

interface KpiCardProps {
  title: string
  value: string
  trend?: Trend
  changePercent?: number | null
  icon: ComponentType<SVGProps<SVGSVGElement>>
  underlineClassName?: string
}

function formatChangePercent(value: number): string {
  const abs = Math.abs(value)
  return abs % 1 === 0 ? `${abs.toFixed(0)}%` : `${abs.toFixed(1)}%`
}

export function KpiCard({
  title,
  value,
  trend = 'neutral',
  changePercent,
  icon: Icon,
  underlineClassName = 'w-3/4',
}: KpiCardProps) {
  const showBadge = changePercent != null && trend !== 'neutral'
  const TrendIcon = trend === 'down' ? ChevronDownIcon : ChevronUpIcon

  return (
    <Card className="relative overflow-hidden border-gray-200 shadow-none">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
          {title}
        </p>

        {showBadge ? (
          <Badge
            color={trend === 'up' ? 'success' : 'failure'}
            icon={TrendIcon}
            className="rounded-full px-2 py-1"
          >
            {formatChangePercent(changePercent)}
          </Badge>
        ) : null}
      </div>

      <p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>

      <div className={`mt-3 h-1 rounded-full bg-slate-900 ${underlineClassName}`} />

      <Icon
        aria-hidden
        className="pointer-events-none absolute right-4 bottom-4 h-16 w-16 text-gray-200"
      />
    </Card>
  )
}
