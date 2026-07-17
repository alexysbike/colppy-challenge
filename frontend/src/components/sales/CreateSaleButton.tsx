import { Button } from 'flowbite-react'
import { PlusIcon } from '@/components/icons'

interface CreateSaleButtonProps {
  onClick: () => void
}

export function CreateSaleButton({ onClick }: CreateSaleButtonProps) {
  return (
    <Button color="blue" onClick={onClick}>
      <PlusIcon className="mr-2 h-4 w-4" />
      Cargar Venta
    </Button>
  )
}
