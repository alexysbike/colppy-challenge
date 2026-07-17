import { useCallback, useState } from 'react'
import { formatDateInput } from '@/lib/dates'
import { useCreateSale } from '@/platform/api'
import type { CreateSaleInput, PaymentMethod } from '@/platform/api'

type FormState = {
  externalId: string
  customer: string
  date: Date
  product: string
  quantity: string
  amount: string
  paymentMethod: PaymentMethod
}

type FieldErrors = Partial<Record<keyof FormState, string>>

const defaultValues: FormState = {
  externalId: '',
  customer: '',
  date: new Date(),
  product: '',
  quantity: '1',
  amount: '',
  paymentMethod: 'efectivo',
}

function parseAmount(value: string): string | null {
  const normalized = value.replace(/[^\d.,]/g, '').replace(',', '.')
  if (!/^\d+(\.\d{1,2})?$/.test(normalized) || Number(normalized) <= 0) {
    return null
  }
  return Number(normalized).toFixed(2)
}

function parseQuantity(value: string): number | null {
  if (!/^\d+$/.test(value)) {
    return null
  }
  const quantity = Number(value)
  if (!Number.isInteger(quantity) || quantity <= 0) {
    return null
  }
  return quantity
}

const EXTERNAL_ID_PATTERN = /^V-\d+$/

export function useCreateSaleForm(onSuccess?: () => void) {
  const { call, loading, error, reset, statusCode } = useCreateSale()
  const [values, setValues] = useState<FormState>(defaultValues)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  const setField = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }))
    setFieldErrors((prev) => ({ ...prev, [key]: undefined }))
  }, [])

  const validate = (): CreateSaleInput | null => {
    const next: FieldErrors = {}

    if (!values.customer.trim()) {
      next.customer = 'El cliente es obligatorio.'
    }
    if (!values.externalId.trim()) {
      next.externalId = 'El ID de venta es obligatorio.'
    } else if (!EXTERNAL_ID_PATTERN.test(values.externalId.trim())) {
      next.externalId = 'Debe tener el formato V-<número>, por ejemplo V-1042.'
    }
    if (!values.product.trim()) {
      next.product = 'El producto es obligatorio.'
    }

    const quantity = parseQuantity(values.quantity)
    if (quantity === null) {
      next.quantity = 'Ingresá una cantidad entera mayor a 0.'
    }

    const amount = parseAmount(values.amount)
    if (!amount) {
      next.amount = 'Ingresá un monto válido mayor a 0.'
    }

    setFieldErrors(next)
    if (Object.keys(next).length > 0) {
      return null
    }

    return {
      externalId: values.externalId.trim(),
      date: formatDateInput(values.date),
      customer: values.customer.trim(),
      product: values.product.trim(),
      quantity: quantity!,
      amount: amount!,
      paymentMethod: values.paymentMethod,
    }
  }

  const submit = async () => {
    const body = validate()
    if (!body) {
      return
    }

    const response = await call(body)
    if (response?.error) {
      return
    }

    onSuccess?.()
    reset()
    setValues({ ...defaultValues, date: new Date() })
    setFieldErrors({})
  }

  const resetForm = useCallback(() => {
    reset()
    setValues({ ...defaultValues, date: new Date() })
    setFieldErrors({})
  }, [reset])

  const apiError =
    (error as { error?: string } | undefined)?.error ??
    (statusCode === 409
      ? 'Ya existe una venta con ese ID y datos distintos.'
      : undefined)

  return {
    values,
    setField,
    fieldErrors,
    apiError,
    loading,
    submit,
    resetForm,
  }
}
