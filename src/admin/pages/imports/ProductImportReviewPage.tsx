import { useState, useMemo, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { FileText, User, Calendar, Hash } from 'lucide-react'

import { DataTable, StatusBadge, PageLayout, PageLoadingSpinner, toast } from '@/shared/ui/components'
import { useBreadcrumb } from '@/admin/context/BreadcrumbContext'
import type { ColumnDef } from '@/shared/ui/components'
import { Button } from '@/shared/ui/primitives'
import { useCan } from '@/shared/auth/adminPermissions'
import { useProductImportRows } from '@/admin/hooks/imports/useProductImportRows'
import { useProductUploadBatches } from '@/admin/hooks/imports/useProductUploadBatches'
import { useBatchStatusPolling } from '@/admin/hooks/imports/useBatchStatusPolling'
import { useApproveBatch } from '@/admin/hooks/imports/useApproveBatch'
import {
  getValidationStatusColor,
  deriveChangeType,
} from '@/admin/hooks/imports/utils'
import type { ProductComparisonDto, BatchStatusResponse } from '@/admin/hooks/imports/types'

function formatUploadDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

interface BatchMetaItemProps {
  icon: React.ReactNode
  label: string
  value: string
}

function BatchMetaItem({ icon, label, value }: BatchMetaItemProps) {
  return (
    <div className="flex flex-1 items-center gap-3 px-5 py-3 min-w-0">
      <div className="shrink-0 text-(--c-text-muted)">{icon}</div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-(--c-text-muted) mb-0.5">
          {label}
        </p>
        <p className="text-sm font-medium text-(--c-text) truncate">{value}</p>
      </div>
    </div>
  )
}

export default function ProductImportReviewPage() {
  const { batchId } = useParams<{ batchId: string }>()
  const canMutate = useCan('import:manage')

  useBreadcrumb([
    { label: 'Home', href: '/admin' },
    { label: 'Bulk Imports', href: '/admin/imports' },
    { label: 'Bulk Product Uploads', href: '/admin/imports/products/list' },
    { label: 'Review Product Import' },
  ])

  const { data: batches } = useProductUploadBatches()
  const batch = useMemo(
    () => batches?.find((b) => b.id === batchId) ?? null,
    [batches, batchId],
  )

  const [batchStatus, setBatchStatus] = useState<BatchStatusResponse | null>(null)
  const [isApproved, setIsApproved] = useState(false)
  const [toastShown, setToastShown] = useState(false)

  const currentStatus = batchStatus?.status ?? null

  const handleStatusChange = useCallback((response: BatchStatusResponse) => {
    setBatchStatus(response)

    if (response.status === 'PROCESSED' && !toastShown && isApproved) {
      toast.success(
        `Import complete — ${response.processedRows} rows processed, ${response.skippedRows} skipped`,
      )
      setToastShown(true)
    }

    if (response.status === 'FAILED' && !toastShown && isApproved) {
      toast.error('Import batch failed', { duration: 0 })
      setToastShown(true)
    }
  }, [toastShown, isApproved])

  const pollingEnabled =
    currentStatus === 'IMPORTING' || currentStatus === 'PROCESSING' || currentStatus === null

  useBatchStatusPolling({
    endpoint: `/admin/products/batches/${batchId}/staged/status`,
    enabled: pollingEnabled,
    onStatusChange: handleStatusChange,
  })

  const shouldFetchRows =
    currentStatus === 'PENDING' ||
    currentStatus === 'PROCESSED' ||
    currentStatus === 'FAILED'

  const { data: rows, isLoading: isLoadingRows } = useProductImportRows(
    shouldFetchRows ? batchId : undefined,
  )

  const { mutateAsync: approveBatch, isPending: isApproving } = useApproveBatch()

  const handleApprove = async () => {
    try {
      await approveBatch({
        endpoint: `/admin/products/batches/${batchId}/staged/async`,
      })
      setIsApproved(true)
      setBatchStatus((prev) => prev ? { ...prev, status: 'PROCESSING' } : null)
    } catch {
      toast.error('Failed to process import — please try again', { duration: 0 })
    }
  }

  const columns: ColumnDef<ProductComparisonDto, unknown>[] = useMemo(
    () => [
      {
        accessorKey: 'sku',
        header: 'SKU',
        cell: ({ row }) => (
          <span className="text-sm text-(--c-text) flex items-center gap-2">
            {row.original.sku}
            {row.original.newProduct && (
              <StatusBadge color="green" label="NEW" className="text-[10px]" />
            )}
          </span>
        ),
        enableSorting: false,
      },
      {
        accessorKey: 'proposedName',
        header: 'Proposed Name',
        cell: ({ row }) => (
          <span className="text-sm text-(--c-text)">{row.original.proposedName}</span>
        ),
        enableSorting: false,
      },
      {
        id: 'changeType',
        header: 'Change Type',
        cell: ({ row }) => (
          <span className="text-sm text-(--c-text)">
            {deriveChangeType(row.original)}
          </span>
        ),
        enableSorting: false,
      },
      {
        id: 'validationStatus',
        header: 'Validation',
        cell: ({ row }) => (
          <StatusBadge
            color={getValidationStatusColor(row.original.validationStatus)}
            label={row.original.validationStatus}
          />
        ),
        enableSorting: false,
      },
    ],
    [],
  )

  if (currentStatus === 'IMPORTING' || currentStatus === null) {
    return (
      <PageLayout title="Review Product Import" subtitle="Processing CSV file...">
        <PageLoadingSpinner />
      </PageLayout>
    )
  }

  const showApproveButton = canMutate && currentStatus === 'PENDING' && !isApproved

  const headerAction = showApproveButton ? (
    <Button variant="solid" onClick={handleApprove} disabled={isApproving}>
      {isApproving ? 'Approving...' : 'Approve Import'}
    </Button>
  ) : undefined

  const totalRows = batchStatus?.totalRows ?? batch?.totalRows ?? 0

  return (
    <PageLayout title="Review Product Import" action={headerAction}>
      {/* Batch metadata summary */}
      <div className="flex items-stretch rounded-lg border border-(--c-border) bg-(--c-table-row-bg) mb-6 divide-x divide-(--c-border) overflow-hidden">
        <BatchMetaItem
          icon={<FileText className="h-4 w-4" />}
          label="File Uploaded"
          value={batch?.filename ?? '—'}
        />
        <BatchMetaItem
          icon={<User className="h-4 w-4" />}
          label="Uploaded By"
          value={batch?.uploadedByUsername ?? '—'}
        />
        <BatchMetaItem
          icon={<Calendar className="h-4 w-4" />}
          label="Uploaded On"
          value={batch?.createdAt ? formatUploadDate(batch.createdAt) : '—'}
        />
        <BatchMetaItem
          icon={<Hash className="h-4 w-4" />}
          label="Total SKUs"
          value={totalRows > 0 ? totalRows.toLocaleString() : '—'}
        />
      </div>

      <DataTable
        columns={columns}
        data={rows ?? []}
        isLoading={isLoadingRows || currentStatus === 'PROCESSING'}
        manualPagination={false}
        emptyMessage="No staged rows found"
      />
    </PageLayout>
  )
}
