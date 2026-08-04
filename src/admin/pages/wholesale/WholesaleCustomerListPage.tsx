import { useState, useEffect, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import type { PaginationState } from '@tanstack/react-table'

import { EllipsisVertical } from 'lucide-react'
import { cn } from '@/shared/utils/cn'

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
import { useWholesaleCustomers, useWholesaleCustomerStatusAction } from '@/admin/hooks/wholesale'
import type { WholesaleCustomerListItem } from '@/admin/hooks/wholesale'
import {
  getAvailableActions,
  getCustomerStatusColor,
  getWholesaleStatusColor,
} from '@/admin/hooks/customers/types'
import type { CustomerStatus, WholesaleStatus } from '@/admin/hooks/customers/types'

const STATUS_FILTER_OPTIONS = [
  { value: 'ALL', label: 'All' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'DISABLED', label: 'Disabled' },
]

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function WholesaleCustomerListPage() {
  const canMutate = useAdminAuthStore((s) => s.role) === 'SUPER_ADMIN'

  const [statusFilter, setStatusFilter] = useState<CustomerStatus | 'ALL'>('ALL')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  // Debounce search input by 300ms
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput)
      setPagination((prev) => ({ ...prev, pageIndex: 0 }))
    }, 300)
    return () => clearTimeout(t)
  }, [searchInput])

  // Confirmation dialog state for suspend action
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    customerId: string
  }>({ open: false, customerId: '' })

  const { mutate: updateWholesaleCustomerStatus, isPending: isUpdatingStatus } = useWholesaleCustomerStatusAction()

  const { data, total, isLoading } = useWholesaleCustomers({
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    status: statusFilter === 'ALL' ? undefined : statusFilter,
    search: search || undefined,
  })

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value as CustomerStatus | 'ALL')
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value)
  }

  const handleActivate = useCallback((customerId: string) => {
    updateWholesaleCustomerStatus({ customerId, status: 'ACTIVE' })
  }, [updateWholesaleCustomerStatus])

  const handleSuspend = useCallback((customerId: string) => {
    setConfirmDialog({ open: true, customerId })
  }, [])

  const handleConfirmSuspend = () => {
    const { customerId } = confirmDialog
    updateWholesaleCustomerStatus(
      { customerId, status: 'DISABLED' },
      { onSettled: () => setConfirmDialog((prev) => ({ ...prev, open: false })) },
    )
  }

  const handleCloseDialog = () => {
    setConfirmDialog((prev) => ({ ...prev, open: false }))
  }

  const columns = useMemo<ColumnDef<WholesaleCustomerListItem, unknown>[]>(
    () => [
      {
        id: 'name',
        header: 'Name',
        cell: ({ row }) => (
          <Link
            to={`/admin/wholesale/customers/${row.original.id}`}
            className="text-(--c-accent) hover:underline"
          >
            {row.original.firstName} {row.original.lastName}
          </Link>
        ),
      },
      {
        accessorKey: 'email',
        header: 'Email',
      },
      {
        accessorKey: 'status',
        header: 'Account Status',
        cell: ({ row }) => (
          <StatusBadge
            label={row.original.status}
            color={getCustomerStatusColor(row.original.status)}
          />
        ),
      },
      {
        id: 'wholesaleApplicationStatus',
        header: 'Application Status',
        cell: ({ row }) => {
          const appStatus = row.original.wholesaleApplicationStatus
          if (!appStatus) return '—'
          return (
            <StatusBadge
              label={appStatus}
              color={getWholesaleStatusColor(appStatus as WholesaleStatus)}
            />
          )
        },
      },
      {
        accessorKey: 'registeredAt',
        header: 'Registered Date',
        cell: ({ row }) => formatDate(row.original.registeredAt),
      },
      ...(canMutate
        ? [
            {
              id: 'actions',
              header: 'Actions',
              cell: ({ row }: { row: { original: WholesaleCustomerListItem } }) => {
                const customer = row.original
                const actions = getAvailableActions(customer.status)
                if (actions.length === 0) return null
                return (
                  <DropdownMenu
                    trigger={
                      <span
                        className={cn(
                          'inline-flex items-center justify-center p-1 rounded-lg hover:bg-(--c-surface-hover)',
                          isUpdatingStatus && 'opacity-50 pointer-events-none',
                        )}
                      >
                        <EllipsisVertical className="h-5 w-5 text-(--c-text-muted)" />
                      </span>
                    }
                  >
                    {actions.map((action) =>
                      action === 'activate' ? (
                        <DropdownItem key={action} onClick={() => handleActivate(customer.id)}>
                          Activate
                        </DropdownItem>
                      ) : (
                        <DropdownItem key={action} onClick={() => handleSuspend(customer.id)} destructive>
                          Suspend
                        </DropdownItem>
                      ),
                    )}
                  </DropdownMenu>
                )
              },
            } as ColumnDef<WholesaleCustomerListItem, unknown>,
          ]
        : []),
    ],
    [canMutate, handleActivate, handleSuspend, isUpdatingStatus],
  )

  const pageCount = total ? Math.ceil(total / pagination.pageSize) : 0

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-(--c-text)">Wholesale Customers</h1>

      {/* Filters */}
      <div className="flex flex-col gap-4">
        <Segment
          options={STATUS_FILTER_OPTIONS}
          value={statusFilter}
          onChange={handleStatusFilterChange}
        />

        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchInput}
            onChange={handleSearchChange}
            className="rounded-md border border-(--c-border) bg-(--c-panel) px-3 py-2 text-sm text-(--c-text) placeholder:text-(--c-text-muted)"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data ?? []}
        isLoading={isLoading}
        manualPagination
        pageCount={pageCount}
        pagination={pagination}
        onPaginationChange={setPagination}
      />

      {/* Confirmation Dialog for Suspend */}
      <ConfirmationDialog
        open={confirmDialog.open}
        onClose={handleCloseDialog}
        onConfirm={handleConfirmSuspend}
        title="Suspend Wholesale Customer"
        description="Are you sure you want to suspend this wholesale customer? They will no longer be able to access the storefront."
        variant="danger"
        confirmLabel="Suspend Customer"
        isLoading={isUpdatingStatus}
      />
    </div>
  )
}
