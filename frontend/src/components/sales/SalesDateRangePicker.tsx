import { useMemo } from 'react'
import { Button, Datepicker, Dropdown, Label } from 'flowbite-react'
import { CalendarIcon, ChevronDownIcon } from 'flowbite-react/icons'
import { formatDateRangeLabel } from '@/lib/dates'

interface SalesDateRangePickerProps {
  from: Date
  to: Date
  onChange: (range: { from: Date; to: Date }) => void
}

export function SalesDateRangePicker({
  from,
  to,
  onChange,
}: SalesDateRangePickerProps) {
  const label = useMemo(() => formatDateRangeLabel(from, to), [from, to])

  return (
    <Dropdown
      dismissOnClick={false}
      renderTrigger={() => (
        <Button color="light" className="min-w-[280px] justify-between">
          <span className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            {label}
          </span>
          <ChevronDownIcon className="h-4 w-4" />
        </Button>
      )}
    >
      <div className="flex flex-col gap-3 p-3">
        <div>
          <Label htmlFor="sales-date-from">Desde</Label>
          <Datepicker
            id="sales-date-from"
            language="es"
            value={from}
            maxDate={to}
            onChange={(date) => {
              if (date) {
                onChange({ from: date, to })
              }
            }}
          />
        </div>
        <div>
          <Label htmlFor="sales-date-to">Hasta</Label>
          <Datepicker
            id="sales-date-to"
            language="es"
            value={to}
            minDate={from}
            onChange={(date) => {
              if (date) {
                onChange({ from, to: date })
              }
            }}
          />
        </div>
      </div>
    </Dropdown>
  )
}
