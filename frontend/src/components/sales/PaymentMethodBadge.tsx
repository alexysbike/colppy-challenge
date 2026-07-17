import { Badge } from 'flowbite-react'
import type { PaymentMethod } from '@/platform/api'

const LABELS: Record<PaymentMethod, string> = {
  transferencia: 'Transferencia',
  tarjeta: 'Tarjeta',
  efectivo: 'Efectivo',
}

const COLORS: Record<PaymentMethod, 'success' | 'warning' | 'info'> = {
  transferencia: 'success',
  tarjeta: 'info',
  efectivo: 'warning',
}

interface PaymentMethodBadgeProps {
  method: PaymentMethod
}

export function PaymentMethodBadge({ method }: PaymentMethodBadgeProps) {
  return (
    <Badge color={COLORS[method]} className="w-fit">
      {LABELS[method]}
    </Badge>
  )
}
