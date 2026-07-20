import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'

import { PageLayout, Upload, toast } from '@/shared/ui/components'
import { useBreadcrumb } from '@/admin/context/BreadcrumbContext'
import { Button } from '@/shared/ui/primitives'
import { useAdminAuthStore } from '@/shared/auth/adminAuthStore'
import { useUploadCsv } from '@/admin/hooks/imports/useUploadCsv'
import { deriveCanMutate } from '@/admin/hooks/imports/utils'

export default function ProductImportUploadPage() {
  const navigate = useNavigate()
  const { mutateAsync, isPending } = useUploadCsv()
  const [file, setFile] = useState<File | null>(null)

  const canMutate = deriveCanMutate(useAdminAuthStore((s) => s.role))

  useBreadcrumb([
    { label: 'Home', href: '/admin' },
    { label: 'Bulk Imports', href: '/admin/imports' },
    { label: 'Upload Product CSV' },
  ])

  if (!canMutate) return <Navigate to="/admin/imports/products/list" replace />

  const handleUpload = async () => {
    if (!file) return

    try {
      const response = await mutateAsync({
        file,
        endpoint: '/admin/products/upload-csv',
      })

      if (!response?.batchId) {
        toast.error('Upload succeeded but no batch ID was returned', { duration: 0 })
        return
      }

      navigate(`/admin/imports/products/bulk-upload/review/${response.batchId}`)
    } catch (err) {
      console.error(err)
      toast.error('Failed to upload CSV', { duration: 0 })
    }
  }

  return (
    <PageLayout title="Upload Product CSV">
      <div className="space-y-4">
        <Upload accept=".csv" onUpload={setFile} disabled={isPending} />
        <p className="text-sm text-(--c-text-muted)">Maximum 5,000 rows per batch</p>
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
