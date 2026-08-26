import {useCallback, useMemo, useState} from 'react'
import {useParams} from 'react-router-dom'
import {Calendar, Eye, FileText, Hash, ShieldUser, User} from 'lucide-react'

import type {ColumnDef} from '@/shared/ui/components'
import {DataTable, Dialog, DialogContent, DialogHeader, PageLayout, RowActionButton, StatusBadge, toast,} from '@/shared/ui/components'
import {useBreadcrumb} from '@/admin/context/BreadcrumbContext'
import {Button} from '@/shared/ui/primitives'
import {useCan} from '@/shared/auth/adminPermissions'
import {usePriceImportRows} from '@/admin/hooks/imports/usePriceImportRows'
import {usePriceImportBatches} from '@/admin/hooks/imports/usePriceImportBatches'
import {useBatchStatusPolling} from '@/admin/hooks/imports/useBatchStatusPolling'
import {useApproveBatch} from '@/admin/hooks/imports/useApproveBatch'
import {derivePriceChangeIndicator, getValidationStatusColor,} from '@/admin/hooks/imports/utils'
import type {BatchStatusResponse, ProductPriceComparisonDto} from '@/admin/hooks/imports/types'
import {formatAmount} from '@/shared/utils/formatAmount'
import {formatDateTime} from '@/shared/utils/formatDateTime'

interface BatchMetaItemProps {
    icon: React.ReactNode
    label: string
    value: string
}

function BatchMetaItem({icon, label, value}: BatchMetaItemProps) {
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

export default function PriceImportReviewPage() {
    const {batchId} = useParams<{ batchId: string }>()
    const canMutate = useCan('import:manage')

    useBreadcrumb([
        {label: 'Home', href: '/admin'},
        {label: 'Bulk Imports', href: '/admin/imports'},
        {label: 'Bulk Price Changes', href: '/admin/imports/products/price/list'},
        {label: 'Price Import Review'},
    ])

    const {data: batches} = usePriceImportBatches()
    const batch = useMemo(
        () => batches?.find((b) => b.id === batchId) ?? null,
        [batches, batchId],
    )

    const [batchStatus, setBatchStatus] = useState<BatchStatusResponse | null>(null)
    const [isApproved, setIsApproved] = useState(false)
    const [toastShown, setToastShown] = useState(false)
    const [errorRow, setErrorRow] = useState<ProductPriceComparisonDto | null>(null)

    const currentStatus = batchStatus?.status ?? null

    const shouldPollImporting = currentStatus === 'IMPORTING' || currentStatus === null
    const shouldPollProcessing = isApproved && currentStatus === 'PROCESSING'
    const shouldPoll = (shouldPollImporting || shouldPollProcessing) && !!batchId

    const handleStatusChange = useCallback(
        (status: BatchStatusResponse) => {
            setBatchStatus(status)

            if (status.status === 'PROCESSED' && !toastShown && isApproved) {
                toast.success('Price import batch processed successfully')
                setToastShown(true)
            }

            if (status.status === 'FAILED' && !toastShown && isApproved) {
                toast.error('Import batch failed', {duration: 0})
                setToastShown(true)
            }
        },
        [toastShown, isApproved],
    )

    useBatchStatusPolling({
        endpoint: `/admin/products/price/batches/${batchId}/staged/status`,
        enabled: shouldPoll,
        onStatusChange: handleStatusChange,
    })

    const {data: rows, isLoading: rowsLoading} = usePriceImportRows(
        currentStatus === 'PENDING' ||
        currentStatus === 'PROCESSING' ||
        currentStatus === 'PROCESSED' ||
        currentStatus === 'FAILED'
            ? batchId
            : undefined,
    )

    const {mutateAsync: approveBatch, isPending: isApproving} = useApproveBatch()

    const handleApprove = async () => {
        try {
            await approveBatch({
                endpoint: `/admin/products/price/batches/${batchId}/staged/async`,
            })
            setIsApproved(true)
        } catch (err) {
            toast.error(
                err instanceof Error ? err.message : 'Failed to approve batch',
                {duration: 0},
            )
        }
    }

    const columns: ColumnDef<ProductPriceComparisonDto, unknown>[] = useMemo(
        () => [
            {
                accessorKey: 'sku',
                header: 'SKU',
                cell: ({row}) => (
                    <span className="text-sm font-medium text-(--c-text)">{row.original.sku}</span>
                ),
                enableSorting: false,
            },
            {
                id: 'currentRetailPrice',
                header: 'Current Retail',
                cell: ({row}) => (
                    <span className="text-sm text-(--c-text)">
            {row.original.currentRetailPrice !== null
                ? formatAmount(row.original.currentRetailPrice)
                : '—'}
          </span>
                ),
                enableSorting: false,
            },
            {
                id: 'proposedRetailPrice',
                header: 'Proposed Retail',
                cell: ({row}) => (
                    <span className="text-sm text-(--c-text)">
            {formatAmount(row.original.proposedRetailPrice)}
          </span>
                ),
                enableSorting: false,
            },
            {
                id: 'currentWholesalePrice',
                header: 'Current Wholesale',
                cell: ({row}) => (
                    <span className="text-sm text-(--c-text)">
            {row.original.currentWholesalePrice !== null
                ? formatAmount(row.original.currentWholesalePrice)
                : '—'}
          </span>
                ),
                enableSorting: false,
            },
            {
                id: 'proposedWholesalePrice',
                header: 'Proposed Wholesale',
                cell: ({row}) => (
                    <span className="text-sm text-(--c-text)">
            {row.original.proposedWholesalePrice !== null
                ? formatAmount(row.original.proposedWholesalePrice)
                : '—'}
          </span>
                ),
                enableSorting: false,
            },
            {
                id: 'changeIndicator',
                header: 'Change',
                cell: ({row}) => (
                    <span className="text-sm text-(--c-text)">
            {derivePriceChangeIndicator(row.original)}
          </span>
                ),
                enableSorting: false,
            },
            {
                id: 'validationStatus',
                header: 'Validation',
                cell: ({row}) => (
                    <StatusBadge
                        color={getValidationStatusColor(row.original.validationStatus)}
                        label={row.original.validationStatus}
                    />
                ),
                enableSorting: false,
            },
            {
                id: 'actions',
                header: 'Actions',
                cell: ({row}) => (
                    <div className="flex items-center gap-1">
                        {!!row.original.validationErrors && (
                            <RowActionButton
                                onClick={() => setErrorRow(row.original)}
                                aria-label={`View validation errors for ${row.original.sku}`}
                            >
                                <Eye className="h-4 w-4"/>
                            </RowActionButton>
                        )}
                    </div>
                ),
                enableSorting: false,
            },
        ],
        [],
    )

    const isTerminal = currentStatus === 'PROCESSED' || currentStatus === 'FAILED'
    const showApproveButton =
        canMutate && currentStatus === 'PENDING' && !isApproved && !isTerminal
    const isLoadingState = currentStatus === 'IMPORTING' || currentStatus === null

    const headerAction = showApproveButton ? (
        <Button variant="solid" onClick={handleApprove} disabled={isApproving}>
            {isApproving ? 'Approving...' : 'Approve Import'}
        </Button>
    ) : undefined

    const totalRows = batchStatus?.totalRows ?? batch?.totalRows ?? 0

    return (
        <PageLayout title="Price Import Review" action={headerAction}>
            {/* Batch metadata summary */}
            <div
                className="flex items-stretch rounded-lg border border-(--c-border) bg-(--c-table-row-bg) mb-6 divide-x divide-(--c-border) overflow-hidden">
                <BatchMetaItem
                    icon={<FileText className="h-4 w-4"/>}
                    label="File Uploaded"
                    value={batch?.filename ?? '—'}
                />
                <BatchMetaItem
                    icon={<User className="h-4 w-4"/>}
                    label="Uploaded By"
                    value={batch?.uploadedByUsername ?? '—'}
                />
                <BatchMetaItem
                    icon={<Calendar className="h-4 w-4"/>}
                    label="Uploaded On"
                    value={batch?.createdAt ? formatDateTime(batch.createdAt) : '—'}
                />
                <BatchMetaItem
                    icon={<Hash className="h-4 w-4"/>}
                    label="Total SKUs"
                    value={totalRows > 0 ? totalRows.toLocaleString() : '—'}
                />
                <BatchMetaItem
                    icon={<ShieldUser className="h-4 w-4"/>}
                    label="Approved By"
                    value={batch?.approvedByUsername ?? '—'}
                />
            </div>

            <DataTable
                columns={columns}
                data={rows ?? []}
                isLoading={rowsLoading || isLoadingState}
                manualPagination={false}
                emptyMessage="No staged rows found"
            />

            <Dialog open={errorRow !== null} onClose={() => setErrorRow(null)} size="md">
                <DialogHeader
                    title="Validation Errors"
                    description={errorRow ? `SKU: ${errorRow.sku}` : undefined}
                />
                <DialogContent>
                    <ul className="list-disc pl-5 space-y-2">
                        {(errorRow?.validationErrors?.split('; ') ?? []).map((error, i) => (
                            <li key={i} className="text-sm text-(--c-text)">
                                {error}
                            </li>
                        ))}
                    </ul>
                </DialogContent>
            </Dialog>
        </PageLayout>
    )
}
