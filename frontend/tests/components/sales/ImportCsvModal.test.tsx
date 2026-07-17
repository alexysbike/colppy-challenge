import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ImportCsvModal } from '@/components/sales/ImportCsvModal'
import { importResultFixture } from '../../test-utils/mocks/sales.fixtures'

const importFile = vi.fn()
const reset = vi.fn()

vi.mock('@/platform/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/platform/api')>()
  return {
    ...actual,
    useImportSales: () => ({
      importFile,
      loading: false,
      error: undefined,
      reset,
      data: undefined,
      statusCode: undefined,
      headers: undefined,
      call: importFile,
    }),
  }
})

describe('ImportCsvModal', () => {
  it('rejects non-csv files', async () => {
    render(<ImportCsvModal open onClose={vi.fn()} />)

    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['data'], 'sales.txt', { type: 'text/plain' })

    fireEvent.change(input, { target: { files: [file] } })

    expect(await screen.findByText('Solo se permiten archivos .csv')).toBeInTheDocument()
  })

  it('imports csv and shows result', async () => {
    const user = userEvent.setup()
    importFile.mockResolvedValue({
      data: importResultFixture,
      statusCode: 200,
      headers: {},
    })

    render(<ImportCsvModal open onClose={vi.fn()} onSuccess={vi.fn()} />)

    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['id,amount'], 'sales.csv', { type: 'text/csv' })
    fireEvent.change(input, { target: { files: [file] } })

    expect(screen.getByText(/sales.csv/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Importar' }))

    await waitFor(() => {
      expect(importFile).toHaveBeenCalledWith(file)
      expect(screen.getByText(/Importación finalizada/)).toBeInTheDocument()
      expect(screen.getByText('Monto inválido')).toBeInTheDocument()
    })
  })

  it('calls onSuccess when rows are created', async () => {
    const user = userEvent.setup()
    const onSuccess = vi.fn()
    importFile.mockResolvedValue({
      data: importResultFixture,
      statusCode: 200,
      headers: {},
    })

    render(<ImportCsvModal open onClose={vi.fn()} onSuccess={onSuccess} />)

    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['id,amount'], 'sales.csv', { type: 'text/csv' })
    fireEvent.change(input, { target: { files: [file] } })

    await user.click(screen.getByRole('button', { name: 'Importar' }))
    await waitFor(() => expect(onSuccess).toHaveBeenCalled())
  })

  it('resets state on close', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    render(<ImportCsvModal open onClose={onClose} />)
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(reset).toHaveBeenCalled()
    expect(onClose).toHaveBeenCalled()
  })

  it('accepts csv via drag and drop', async () => {
    render(<ImportCsvModal open onClose={vi.fn()} />)

    const dropZone = screen.getByText(/Arrastrá un archivo CSV/).closest('[role="button"]')
    const file = new File(['id,amount'], 'sales.csv', { type: 'text/csv' })

    fireEvent.drop(dropZone!, {
      dataTransfer: { files: [file] },
    })

    expect(await screen.findByText(/sales.csv/)).toBeInTheDocument()
  })

  it('does not call onSuccess when no rows are created', async () => {
    const user = userEvent.setup()
    const onSuccess = vi.fn()
    importFile.mockResolvedValue({
      data: { ...importResultFixture, created: 0 },
      statusCode: 200,
      headers: {},
    })

    render(<ImportCsvModal open onClose={vi.fn()} onSuccess={onSuccess} />)

    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['id,amount'], 'sales.csv', { type: 'text/csv' })
    fireEvent.change(input, { target: { files: [file] } })

    await user.click(screen.getByRole('button', { name: 'Importar' }))
    await waitFor(() => expect(importFile).toHaveBeenCalled())
    expect(onSuccess).not.toHaveBeenCalled()
  })

  it('closes from result view', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    importFile.mockResolvedValue({
      data: importResultFixture,
      statusCode: 200,
      headers: {},
    })

    render(<ImportCsvModal open onClose={onClose} />)

    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['id,amount'], 'sales.csv', { type: 'text/csv' })
    fireEvent.change(input, { target: { files: [file] } })

    await user.click(screen.getByRole('button', { name: 'Importar' }))
    await waitFor(() => screen.getByRole('button', { name: 'Cerrar' }))
    await user.click(screen.getByRole('button', { name: 'Cerrar' }))

    expect(onClose).toHaveBeenCalled()
  })
})
