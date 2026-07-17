import { useState } from 'react'
import {
  CreateSaleModal,
  ImportCsvModal,
  SalesDashboardHeader,
  SalesKpiCards,
  SalesTable,
} from '@/components/sales'

export function DashboardScreen() {
  const [createSaleOpen, setCreateSaleOpen] = useState(false)
  const [importCsvOpen, setImportCsvOpen] = useState(false)
  const [salesRefreshKey, setSalesRefreshKey] = useState(0)

  const handleSaleCreated = () => {
    setCreateSaleOpen(false)
    setSalesRefreshKey((key) => key + 1)
  }

  const handleImportSuccess = () => {
    setSalesRefreshKey((key) => key + 1)
  }

  return (
    <div className="flex flex-col gap-6">
      <SalesDashboardHeader
        onCreateSale={() => setCreateSaleOpen(true)}
        onImportCsv={() => setImportCsvOpen(true)}
      />
      <SalesKpiCards refreshKey={salesRefreshKey} />
      <SalesTable refreshKey={salesRefreshKey} />
      <CreateSaleModal
        open={createSaleOpen}
        onClose={() => setCreateSaleOpen(false)}
        onSuccess={handleSaleCreated}
      />
      <ImportCsvModal
        open={importCsvOpen}
        onClose={() => setImportCsvOpen(false)}
        onSuccess={handleImportSuccess}
      />
    </div>
  )
}
