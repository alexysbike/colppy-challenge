import {
  Alert,
  Button,
  Datepicker,
  HelperText,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Select,
  Spinner,
  TextInput,
} from 'flowbite-react'
import { PAYMENT_METHODS } from '@/platform/api'
import type { PaymentMethod } from '@/platform/api'
import { useCreateSaleForm } from './hooks/useCreateSaleForm'

interface CreateSaleModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  transferencia: 'Transferencia',
  tarjeta: 'Tarjeta',
  efectivo: 'Efectivo',
}

export function CreateSaleModal({ open, onClose, onSuccess }: CreateSaleModalProps) {
  const { values, setField, fieldErrors, apiError, loading, submit, resetForm } =
    useCreateSaleForm(onSuccess)

  const handleClose = () => {
    if (loading) {
      return
    }
    resetForm()
    onClose()
  }

  return (
    <Modal show={open} size="2xl" onClose={handleClose}>
      <ModalHeader>Cargar Venta Manual</ModalHeader>

      <ModalBody>
        <div className="flex flex-col gap-4">
          {apiError ? <Alert color="failure">{apiError}</Alert> : null}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label
                htmlFor="create-sale-external-id"
                className="mb-1 text-xs font-semibold uppercase text-gray-500"
              >
                ID DE VENTA
              </Label>
              <TextInput
                id="create-sale-external-id"
                placeholder="V-1042"
                value={values.externalId}
                color={fieldErrors.externalId ? 'failure' : undefined}
                onChange={(event) => setField('externalId', event.target.value)}
              />
              {fieldErrors.externalId ? (
                <HelperText color="failure">{fieldErrors.externalId}</HelperText>
              ) : null}
            </div>

            <div>
              <Label
                htmlFor="create-sale-customer"
                className="mb-1 text-xs font-semibold uppercase text-gray-500"
              >
                CLIENTE
              </Label>
              <TextInput
                id="create-sale-customer"
                placeholder="Nombre o Razón Social"
                value={values.customer}
                color={fieldErrors.customer ? 'failure' : undefined}
                onChange={(event) => setField('customer', event.target.value)}
              />
              {fieldErrors.customer ? (
                <HelperText color="failure">{fieldErrors.customer}</HelperText>
              ) : null}
            </div>
          </div>

          <div>
            <Label
              htmlFor="create-sale-date"
              className="mb-1 text-xs font-semibold uppercase text-gray-500"
            >
              FECHA DE VENTA
            </Label>
            <Datepicker
              id="create-sale-date"
              language="es"
              value={values.date}
              onChange={(date) => {
                if (date) {
                  setField('date', date)
                }
              }}
            />
          </div>

          <div>
            <Label
              htmlFor="create-sale-product"
              className="mb-1 text-xs font-semibold uppercase text-gray-500"
            >
              PRODUCTO
            </Label>
            <TextInput
              id="create-sale-product"
              placeholder="Nombre del producto"
              value={values.product}
              color={fieldErrors.product ? 'failure' : undefined}
              onChange={(event) => setField('product', event.target.value)}
            />
            {fieldErrors.product ? (
              <HelperText color="failure">{fieldErrors.product}</HelperText>
            ) : null}
          </div>

          <div className="max-w-xs">
            <Label
              htmlFor="create-sale-quantity"
              className="mb-1 text-xs font-semibold uppercase text-gray-500"
            >
              CANTIDAD
            </Label>
            <TextInput
              id="create-sale-quantity"
              type="number"
              min={1}
              step={1}
              placeholder="1"
              value={values.quantity}
              color={fieldErrors.quantity ? 'failure' : undefined}
              onChange={(event) => setField('quantity', event.target.value)}
            />
            {fieldErrors.quantity ? (
              <HelperText color="failure">{fieldErrors.quantity}</HelperText>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label
                htmlFor="create-sale-amount"
                className="mb-1 text-xs font-semibold uppercase text-gray-500"
              >
                MONTO
              </Label>
              <TextInput
                id="create-sale-amount"
                placeholder="$ 0.00"
                value={values.amount}
                color={fieldErrors.amount ? 'failure' : undefined}
                onChange={(event) => setField('amount', event.target.value)}
              />
              {fieldErrors.amount ? (
                <HelperText color="failure">{fieldErrors.amount}</HelperText>
              ) : null}
            </div>

            <div>
              <Label
                htmlFor="create-sale-payment-method"
                className="mb-1 text-xs font-semibold uppercase text-gray-500"
              >
                MÉTODO DE PAGO
              </Label>
              <Select
                id="create-sale-payment-method"
                value={values.paymentMethod}
                onChange={(event) =>
                  setField('paymentMethod', event.target.value as PaymentMethod)
                }
              >
                {PAYMENT_METHODS.map((method) => (
                  <option key={method} value={method}>
                    {PAYMENT_LABELS[method]}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </div>
      </ModalBody>

      <ModalFooter className="justify-end gap-2">
        <Button color="light" disabled={loading} onClick={handleClose}>
          Cancelar
        </Button>
        <Button color="blue" disabled={loading} onClick={() => void submit()}>
          {loading ? <Spinner size="sm" className="mr-2" /> : null}
          Guardar Venta
        </Button>
      </ModalFooter>
    </Modal>
  )
}
