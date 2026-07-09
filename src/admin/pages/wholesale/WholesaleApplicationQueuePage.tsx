import { useState, useMemo } from 'react'
import type { PaginationState } from '@tanstack/react-table'
import { EllipsisVertical } from 'lucide-react'

import {
  DataTable,
  Segment,
  ConfirmationDialog,
  StatusBadge,
  DropdownMenu,
  DropdownItem,
} from '@/shared/ui/components'
import type { ColumnDef } from '@/shared/ui/components'
import { useAdminAuthStore } from '@/shared/auth/adminAuthStore'
import { useWholesaleApplications, useWholesaleApplicationAction } from '@/admin/hooks/wholesale'
import type { WholesaleApplicationListItem } from '@/admin/hooks/wholesale'
import { getWholesaleStatusColor } from '@/admin/hooks/customers/types'
import { cn } from '@/shared/utils/cn'

const STATUS_FILTER_OPTIONS = [
  { value: 'ALL', label: 'All' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
]

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function WholesaleApplicationQueuePage() {
  const canMutate = useAdminAuthStore((s) => s.role) === 'SUPER_ADMIN'

  const [statusFilter, setStatusFilter] = useState('PENDING')
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  // Confirmation dialog state for reject action
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    applicationId: string
    customerId: string
  }>({ open: false, applicationId: '', customerId: '' })

  const applicationAction = useWholesaleApplicationAction()

  const { data, total, isLoading } = useWholesaleApplications({
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    status: statusFilter === 'ALL' ? undefined : (statusFilter as 'PENDING' | 'APPROVED' | 'REJECTED'),
  })

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value)
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }

  const handleApprove = (applicationId: string) => {
    applicationAction.mutate({ applicationId, action: 'approve' })
  }

  const handleReject = (applicationId: string) => {
    setConfirmDialog({ open: true, applicationId, customerId: '' })
  }

  const handleConfirmReject = () => {
    const { applicationId } = confirmDialog
    applicationAction.mutate(
      { applicationId, action: 'reject' },
      { onSettled: () => setConfirmDialog((prev) => ({ ...prev, open: false })) },
    )
  }

  const handleCloseDialog = () => {
    setConfirmDialog((prev) => ({ ...prev, open: false }))
  }

  const columns = useMemo<ColumnDef<WholesaleApplicationListItem, unknown>[]>(
    () => [
      {
        id: 'name',
        header: 'Name',
        cell: ({ row }) => (
          <span>
            {row.original.firstName} {row.original.lastName}
          </span>
        ),
      },
      {
        id: 'email',
        header: 'Email',
        accessorKey: 'email',
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <StatusBadge
            label={row.original.status}
            color={getWholesaleStatusColor(row.original.status)}
          />
        ),
      },
      {
        accessorKey: 'createdAt',
        header: 'Submitted Date',
        cell: ({ row }) => formatDate(row.original.createdAt),
      },
      ...(canMutate
        ? [
            {
              id: 'actions',
              header: 'Actions',
              cell: ({ row }: { row: { original: WholesaleApplicationListItem } }) => {
                const application = row.original
                if (application.status !== 'PENDING') return null
                return (
                  <div data-testid="application-actions-menu">
                    <DropdownMenu
                      trigger={
                        <span
                          className={cn(
                            'inline-flex items-center justify-center p-1 rounded-lg hover:bg-(--c-surface-hover)',
                            applicationAction.isPending && 'opacity-50 pointer-events-none',
                          )}
                        >
                          <EllipsisVertical className="h-5 w-5 text-(--c-text-muted)" />
                        </span>
                      }
                    >
                      <div data-testid="action-approve">
                        <DropdownItem
                          onClick={() => handleApprove(application.id)}
                        >
                          Approve
                        </DropdownItem>
                      </div>
                      <div data-testid="action-reject">
                        <DropdownItem
                          onClick={() => handleReject(application.id)}
                          destructive
                        >
                          Reject
                        </DropdownItem>
                      </div>
                    </DropdownMenu>
                  </div>
                )
              },
            } as ColumnDef<WholesaleApplicationListItem, unknown>,
          ]
        : []),
    ],
    [canMutate, applicationAction.isPending],
  )

  const pageCount = total ? Math.ceil(total / pagination.pageSize) : 0

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-(--c-text)">Wholesale Applications</h1>

      {/* Filters */}
      <div className="flex flex-col gap-4">
        <Segment
          options={STATUS_FILTER_OPTIONS}
          value={statusFilter}
          onChange={handleStatusFilterChange}
        />
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={data ?? []}
        isLoading={isLoading}
        manualPagination
        pageCount={pageCount}
        pagination={pagination}
        onPaginationChange={setPagination}
      />

      {/* Confirmation Dialog for Reject */}
      <ConfirmationDialog
        open={confirmDialog.open}
        onClose={handleCloseDialog}
        onConfirm={handleConfirmReject}
        title="Reject Application"
        description="Are you sure you want to reject this wholesale application? This action cannot be undone."
        variant="danger"
        confirmLabel="Reject Application"
        isLoading={applicationAction.isPending}
      />
    </div>
  )
}
