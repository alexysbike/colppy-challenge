import { Button } from 'flowbite-react'
import { UploadIcon } from '@/components/icons'

interface ImportCsvButtonProps {
  onClick: () => void
}

export function ImportCsvButton({ onClick }: ImportCsvButtonProps) {
  return (
    <Button outline color="blue" onClick={onClick}>
      <UploadIcon className="mr-2 h-4 w-4" />
      Importar CSV
    </Button>
  )
}
