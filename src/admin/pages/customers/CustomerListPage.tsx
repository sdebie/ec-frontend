import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import type { PaginationState } from '@tanstack/react-table'

import {
  DataTable,
  Segment,
  ConfirmationDialog,
  StatusBadge,
} from '@/shared/ui/components'
import type { ColumnDef } from '@/shared/ui/components'
import { useAdminAuthStore } from '@/shared/auth/adminAuthStore'
import { useCustomers, useUpdateCustomerStatus } from '@/admin/hooks/customers'
import type { AdminCustomerSummary } from '@/admin/hooks/customers'
import { getAvailableActions, getCustomerStatusColor } from '@/admin/hooks/customers'
import { CustomerActionsMenu } from './components/CustomerActionsMenu'

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

export function CustomerListPage() {
  const canMutate = useAdminAuthStore((s) => s.role) === 'SUPER_ADMIN'

  const [statusFilter, setStatusFilter] = useState('ALL')
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

  const updateStatus = useUpdateCustomerStatus()

  const { data, isLoading } = useCustomers({
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    status: statusFilter === 'ALL' ? undefined : statusFilter,
    search: search || undefined,
  })

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value)
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value)
  }

  const handleActivate = (customerId: string) => {
    updateStatus.mutate({ customerId, status: 'ACTIVE' })
  }

  const handleSuspend = (customerId: string) => {
    setConfirmDialog({ open: true, customerId })
  }

  const handleConfirmSuspend = () => {
    const { customerId } = confirmDialog
    updateStatus.mutate(
      { customerId, status: 'DISABLED' },
      { onSettled: () => setConfirmDialog((prev) => ({ ...prev, open: false })) },
    )
  }

  const handleCloseDialog = () => {
    setConfirmDialog((prev) => ({ ...prev, open: false }))
  }

  const columns = useMemo<ColumnDef<AdminCustomerSummary, unknown>[]>(
    () => [
      {
        id: 'name',
        header: 'Name',
        cell: ({ row }) => (
          <Link
            to={`/admin/customers/${row.original.id}`}
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
        accessorKey: 'shopperType',
        header: 'Type',
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <StatusBadge
            label={row.original.status}
            color={getCustomerStatusColor(row.original.status)}
          />
        ),
      },
      {
        accessorKey: 'registeredAt',
        header: 'Registered',
        cell: ({ row }) => formatDate(row.original.registeredAt),
      },
      ...(canMutate
        ? [
            {
              id: 'actions',
              header: 'Actions',
              cell: ({ row }: { row: { original: AdminCustomerSummary } }) => {
                const customer = row.original
                const actions = getAvailableActions(customer.status)
                if (actions.length === 0) return null
                return (
                  <CustomerActionsMenu
                    customer={customer}
                    onActivate={() => handleActivate(customer.id)}
                    onSuspend={() => handleSuspend(customer.id)}
                  />
                )
              },
            } as ColumnDef<AdminCustomerSummary, unknown>,
          ]
        : []),
    ],
    [canMutate, handleActivate, handleSuspend],
  )

  const pageCount = data ? Math.ceil(data.total / pagination.pageSize) : 0

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-(--c-text)">Customers</h1>

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

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={data?.data ?? []}
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
        title="Suspend Customer"
        description="Are you sure you want to suspend this customer? They will no longer be able to access the storefront."
        variant="danger"
        confirmLabel="Suspend Customer"
        isLoading={updateStatus.isPending}
      />
    </div>
  )
}
