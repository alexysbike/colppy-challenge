import { useCallback, useRef, useState } from 'react'
import {
  Alert,
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Spinner,
} from 'flowbite-react'
import { UploadIcon } from '@/components/icons'
import { useImportSales } from '@/platform/api'
import type { ImportSalesResult } from '@/platform/api'

interface ImportCsvModalProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}

function isCsvFile(file: File) {
  return file.name.toLowerCase().endsWith('.csv') || file.type === 'text/csv'
}

export function ImportCsvModal({ open, onClose, onSuccess }: ImportCsvModalProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [result, setResult] = useState<ImportSalesResult | null>(null)

  const { importFile, loading, error, reset } = useImportSales()

  const apiError = (error as { error?: string } | undefined)?.error

  const handleFile = useCallback((file: File | undefined) => {
    if (!file) {
      return
    }
    if (!isCsvFile(file)) {
      setFileError('Solo se permiten archivos .csv')
      setSelectedFile(null)
      return
    }
    setFileError(null)
    setSelectedFile(file)
  }, [])

  const handleImport = async () => {
    if (!selectedFile) {
      return
    }

    const response = await importFile(selectedFile)
    if (response?.error) {
      return
    }

    setResult(response.data ?? null)
    if ((response.data?.created ?? 0) > 0) {
      onSuccess?.()
    }
  }

  const handleClose = () => {
    if (loading) {
      return
    }
    reset()
    setSelectedFile(null)
    setFileError(null)
    setResult(null)
    onClose()
  }

  const showResult = result !== null

  return (
    <Modal show={open} size="2xl" onClose={handleClose}>
      <ModalHeader>Importar ventas desde CSV</ModalHeader>

      <ModalBody>
        {showResult ? (
          <ImportResultView result={result} />
        ) : (
          <div className="flex flex-col gap-4">
            {apiError ? <Alert color="failure">{apiError}</Alert> : null}
            {fileError ? <Alert color="failure">{fileError}</Alert> : null}

            <input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(event) => {
                handleFile(event.target.files?.[0])
                event.target.value = ''
              }}
            />

            <div
              role="button"
              tabIndex={0}
              className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center transition hover:border-blue-400 hover:bg-blue-50"
              onClick={() => inputRef.current?.click()}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  inputRef.current?.click()
                }
              }}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault()
                handleFile(event.dataTransfer.files?.[0])
              }}
            >
              <UploadIcon className="h-8 w-8 text-gray-400" />
              <p className="text-sm font-medium text-gray-700">
                Arrastrá un archivo CSV o hacé clic para seleccionarlo
              </p>
              <p className="text-xs text-gray-500">Máximo 5 MB</p>
            </div>

            {selectedFile ? (
              <p className="text-sm text-gray-600">
                Archivo seleccionado:{' '}
                <span className="font-medium">{selectedFile.name}</span>
              </p>
            ) : null}
          </div>
        )}
      </ModalBody>

      <ModalFooter className="justify-end gap-2">
        {showResult ? (
          <Button color="blue" onClick={handleClose}>
            Cerrar
          </Button>
        ) : (
          <>
            <Button color="light" disabled={loading} onClick={handleClose}>
              Cancelar
            </Button>
            <Button
              color="blue"
              disabled={loading || !selectedFile}
              onClick={() => void handleImport()}
            >
              {loading ? <Spinner size="sm" className="mr-2" /> : null}
              Importar
            </Button>
          </>
        )}
      </ModalFooter>
    </Modal>
  )
}

function ImportResultView({ result }: { result: ImportSalesResult }) {
  const hasErrors = result.errors.length > 0

  return (
    <div className="flex flex-col gap-4">
      <Alert color={result.failed > 0 ? 'warning' : 'success'}>
        Importación finalizada: {result.created} creadas, {result.skipped} omitidas,{' '}
        {result.failed} con error.
      </Alert>

      {hasErrors ? (
        <div className="max-h-64 overflow-y-auto rounded-lg border border-gray-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-2">Fila</th>
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Error</th>
              </tr>
            </thead>
            <tbody>
              {result.errors.map((rowError) => (
                <tr
                  key={`${rowError.row}-${rowError.externalId ?? 'no-id'}`}
                  className="border-t"
                >
                  <td className="px-4 py-2">{rowError.row}</td>
                  <td className="px-4 py-2">{rowError.externalId ?? '—'}</td>
                  <td className="px-4 py-2">{rowError.error}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  )
}
