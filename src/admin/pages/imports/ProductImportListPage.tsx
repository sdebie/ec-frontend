import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, RefreshCw } from 'lucide-react'
import { useBreadcrumb } from '@/admin/context/BreadcrumbContext'

import {
  DataTable,
  StatusBadge,
  PageLayout,
  Dialog,
  DialogHeader,
  DialogContent,
  DialogFooter,
  RowActionButton,
  Upload,
  toast,
} from '@/shared/ui/components'
import type { ColumnDef } from '@/shared/ui/components'
import { Button } from '@/shared/ui/primitives'
import { useAdminAuthStore } from '@/shared/auth/adminAuthStore'
import { useProductUploadBatches } from '@/admin/hooks/imports/useProductUploadBatches'
import { useRefreshBatchStatus } from '@/admin/hooks/imports/useRefreshBatchStatus'
import { useUploadCsv } from '@/admin/hooks/imports/useUploadCsv'
import { getBatchStatusColor, deriveCanMutate } from '@/admin/hooks/imports/utils'
import type { ProductUploadBatchDto } from '@/admin/hooks/imports/types'

function RefreshButton({ batchId, onSuccess }: { batchId: string; onSuccess: () => void }) {
  const { mutateAsync, isPending } = useRefreshBatchStatus()

  const handleRefresh = async () => {
    try {
      await mutateAsync({
        endpoint: `/admin/products/batches/${batchId}/staged/status`,
      })
      onSuccess()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to refresh batch status',
        { duration: 0 },
      )
    }
  }

  return (
    <RowActionButton onClick={handleRefresh} disabled={isPending} aria-label="Refresh batch status">
      <RefreshCw className={`h-4 w-4 ${isPending ? 'animate-spin' : ''}`} />
    </RowActionButton>
  )
}

export default function ProductImportListPage() {
  const navigate = useNavigate()
  const canMutate = deriveCanMutate(useAdminAuthStore((s) => s.role))
  const { data, isLoading, refetch } = useProductUploadBatches()

  useBreadcrumb([
    { label: 'Home', href: '/admin' },
    { label: 'Bulk Imports', href: '/admin/imports' },
    { label: 'Product Imports' },
  ])

  const [uploadOpen, setUploadOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const { mutateAsync: uploadCsv, isPending: isUploading } = useUploadCsv()

  const handleUpload = async () => {
    if (!file) return
    try {
      const response = await uploadCsv({ file, endpoint: '/admin/products/upload-csv' })
      if (!response?.batchId) {
        toast.error('Upload succeeded but no batch ID was returned', { duration: 0 })
        return
      }
      setUploadOpen(false)
      setFile(null)
      navigate(`/admin/imports/products/bulk-upload/review/${response.batchId}`)
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to upload CSV',
        { duration: 0 },
      )
    }
  }

  const handleCloseUpload = () => {
    if (isUploading) return
    setUploadOpen(false)
    setFile(null)
  }

  const columns: ColumnDef<ProductUploadBatchDto, unknown>[] = useMemo(
    () => [
      {
        accessorKey: 'createdAt',
        header: 'Date',
        cell: ({ row }) => (
          <span className="text-sm text-(--c-text)">
            {new Date(row.original.createdAt).toLocaleDateString()}
          </span>
        ),
        enableSorting: false,
      },
      {
        accessorKey: 'filename',
        header: 'Filename',
        cell: ({ row }) => (
          <span className="text-sm text-(--c-text)">{row.original.filename}</span>
        ),
        enableSorting: false,
      },
      {
        id: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <StatusBadge
            color={getBatchStatusColor(row.original.status)}
            label={row.original.status}
          />
        ),
        enableSorting: false,
      },
      {
        accessorKey: 'totalRows',
        header: 'Total Rows',
        cell: ({ row }) => (
          <span className="text-sm text-(--c-text)">{row.original.totalRows}</span>
        ),
        enableSorting: false,
      },
      {
        accessorKey: 'processedRows',
        header: 'Processed',
        cell: ({ row }) => (
          <span className="text-sm text-(--c-text)">{row.original.processedRows}</span>
        ),
        enableSorting: false,
      },
      {
        accessorKey: 'skippedRows',
        header: 'Skipped',
        cell: ({ row }) => (
          <span className="text-sm text-(--c-text)">{row.original.skippedRows}</span>
        ),
        enableSorting: false,
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const { status, id } = row.original
          const isProcessing = status === 'IMPORTING' || status === 'PROCESSING'

          return (
            <div className="flex items-center gap-1">
              <RowActionButton
                onClick={() => navigate(`/admin/imports/products/bulk-upload/review/${id}`)}
                aria-label={status === 'PROCESSED' || status === 'FAILED' ? 'View results' : 'Review'}
              >
                <Eye className="h-4 w-4" />
              </RowActionButton>
              {isProcessing && (
                <RefreshButton batchId={id} onSuccess={() => refetch()} />
              )}
            </div>
          )
        },
        enableSorting: false,
      },
    ],
    [navigate, refetch],
  )

  const headerAction = canMutate ? (
    <Button variant="solid" onClick={() => setUploadOpen(true)}>
      + Upload CSV
    </Button>
  ) : undefined

  return (
    <>
      <PageLayout title="Bulk Product Upload" action={headerAction}>
        <DataTable
          columns={columns}
          data={data ?? []}
          isLoading={isLoading}
          manualPagination={false}
          emptyMessage="No product import batches found"
        />
      </PageLayout>

      <Dialog open={uploadOpen} onClose={handleCloseUpload} size="md">
        <DialogHeader
          title="Upload Product CSV"
          description="Each row represents one product or variant. Large files are staged in the background."
        />
        <DialogContent>
          <Upload accept=".csv" onUpload={setFile} disabled={isUploading} />
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={handleCloseUpload} disabled={isUploading}>
            Cancel
          </Button>
          <Button variant="solid" onClick={handleUpload} disabled={!file || isUploading}>
            {isUploading ? 'Processing CSV...' : 'Upload'}
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  )
}
