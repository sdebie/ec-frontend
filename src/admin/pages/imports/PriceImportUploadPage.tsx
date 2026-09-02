import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'

import { PageLayout, Upload, toast } from '@/shared/ui/components'
import { useBreadcrumb } from '@/admin/context/BreadcrumbContext'
import { Button } from '@/shared/ui/primitives'
import { useCan } from '@/shared/auth/adminPermissions'
import { useUploadCsv } from '@/admin/hooks/imports/useUploadCsv'
import { PRICE_IMPORT } from '@/admin/api/importEndpoints'

export default function PriceImportUploadPage() {
  const navigate = useNavigate()
  const { mutateAsync, isPending } = useUploadCsv()
  const [file, setFile] = useState<File | null>(null)

  const canMutate = useCan('import:manage')

  useBreadcrumb([
    { label: 'Home', href: '/admin' },
    { label: 'Bulk Imports', href: '/admin/imports' },
    { label: 'Upload Price CSV' },
  ])

  if (!canMutate) return <Navigate to="/admin/imports/products/price/list" replace />

  const handleUpload = async () => {
    if (!file) return

    try {
      const response = await mutateAsync({
        file,
        endpoint: PRICE_IMPORT.upload,
        importType: 'price',
      })

      if (!response?.batchId) {
        toast.error('Upload succeeded but no batch ID was returned', { duration: 0 })
        return
      }

      navigate(`/admin/imports/products/price/bulk-upload/review/${response.batchId}`)
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to upload CSV',
        { duration: 0 },
      )
    }
  }

  return (
    <PageLayout title="Upload Price CSV">
      <div className="space-y-4">
        <Upload accept=".csv" onUpload={setFile} disabled={isPending} />
        <p className="text-sm text-(--c-text-muted)">Maximum 5,000 rows per batch</p>
        <p className="text-sm text-(--c-text-muted)">
          Required columns: <code className="text-xs bg-(--c-bg) px-1 py-0.5 rounded">sku</code>,{' '}
          <code className="text-xs bg-(--c-bg) px-1 py-0.5 rounded">retail_price</code>. Optional:{' '}
          <code className="text-xs bg-(--c-bg) px-1 py-0.5 rounded">wholesale_price</code>,{' '}
          <code className="text-xs bg-(--c-bg) px-1 py-0.5 rounded">retail_sale_price</code>,{' '}
          <code className="text-xs bg-(--c-bg) px-1 py-0.5 rounded">wholesale_sale_price</code>
        </p>
        <Button
          variant="solid"
          onClick={handleUpload}
          disabled={!file || isPending}
        >
          {isPending ? 'Processing CSV...' : 'Upload'}
        </Button>
      </div>
    </PageLayout>
  )
}
