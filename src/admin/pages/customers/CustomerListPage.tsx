import { useState, useEffect, useMemo, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { PaginationState } from '@tanstack/react-table'
import { CircleCheck, Eye, OctagonPause, Search } from 'lucide-react'

import {
  DataTable,
  PageLayout,
  Label,
  Select,
  ConfirmationDialog,
  RowActionButton,
  StatusBadge,
} from '@/shared/ui/components'
import type { ColumnDef } from '@/shared/ui/components'
import { Input } from '@/shared/ui/primitives'
import { useCan } from '@/shared/auth/adminPermissions'
import { useTableSort } from '@/admin/hooks/useTableSort'
import { useCustomers, useUpdateCustomerStatus } from '@/admin/hooks/customers'
import type { AdminCustomerSummary } from '@/admin/hooks/customers'
import { getAvailableActions, getCustomerStatusColor } from '@/admin/hooks/customers'
import { formatDateTime } from '@/shared/utils/formatDateTime'

const STATUS_FILTER_OPTIONS = [
  { value: 'ALL', label: 'All' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'DISABLED', label: 'Disabled' },
]

export function CustomerListPage() {
  const navigate = useNavigate()
  const canMutate = useCan('customer:write')

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

  const { sorting, onSortingChange: onSortingChangeUrl, sort } = useTableSort()

  // useTableSort resets `page` in the URL on a sort change, which is a no-op here —
  // this page's pagination is local component state, not URL-driven. The reset has
  // to happen explicitly, the same way it does for the status filter and search.
  const onSortingChange: typeof onSortingChangeUrl = useCallback(
    (updater) => {
      onSortingChangeUrl(updater)
      setPagination((prev) => ({ ...prev, pageIndex: 0 }))
    },
    [onSortingChangeUrl],
  )

  // Confirmation dialog state for suspend action
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    customerId: string
  }>({ open: false, customerId: '' })

  const { mutate: updateCustomerStatus, isPending: isUpdatingStatus } = useUpdateCustomerStatus()

  const { data, isLoading } = useCustomers({
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    status: statusFilter === 'ALL' ? undefined : statusFilter,
    search: search || undefined,
    sort,
  })

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value)
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value)
  }

  const handleActivate = useCallback((customerId: string) => {
    updateCustomerStatus({ customerId, status: 'ACTIVE' })
  }, [updateCustomerStatus])

  const handleSuspend = useCallback((customerId: string) => {
    setConfirmDialog({ open: true, customerId })
  }, [])

  const handleConfirmSuspend = () => {
    const { customerId } = confirmDialog
    updateCustomerStatus(
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
        // Same accessorKey/id split as email: registeredAt is customer.user.createdAt,
        // one hop through the same join.
        accessorKey: 'registeredAt',
        id: 'user.createdAt',
        header: 'Registered',
        cell: ({ row }) => (
          <span className="whitespace-nowrap">{formatDateTime(row.original.registeredAt)}</span>
        ),
      },
      {
        // Not sortable: concatenates firstName + lastName, and there is no single
        // backend field a "full name" sort could map to.
        id: 'name',
        header: 'Name',
        enableSorting: false,
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
        // accessorKey stays 'email' (the flattened DTO field, needed for TanStack to
        // treat the header as clickable); id is overridden to 'user.email', the real
        // column — email lives on the linked UserEntity, not on Customer itself, and
        // that id is sent to the server unmodified as the sort key.
        accessorKey: 'email',
        id: 'user.email',
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
        id: 'actions',
        header: 'Actions',
        enableSorting: false,
        cell: ({ row }) => {
          const customer = row.original
          const actions = canMutate ? getAvailableActions(customer.status) : []
          return (
            <div className="flex items-center gap-1">
              <RowActionButton
                onClick={() => navigate(`/admin/customers/${customer.id}`)}
                aria-label="View customer"
                data-testid="action-view"
              >
                <Eye className="h-4 w-4" />
              </RowActionButton>
              {actions.includes('suspend') && (
                <RowActionButton
                  onClick={() => handleSuspend(customer.id)}
                  variant="danger"
                  aria-label="Suspend customer"
                  disabled={isUpdatingStatus}
                >
                  <OctagonPause className="h-4 w-4" />
                </RowActionButton>
              )}
              {actions.includes('activate') && (
                <RowActionButton
                  onClick={() => handleActivate(customer.id)}
                  aria-label="Activate customer"
                  disabled={isUpdatingStatus}
                >
                  <CircleCheck className="h-4 w-4" />
                </RowActionButton>
              )}
            </div>
          )
        },
      } as ColumnDef<AdminCustomerSummary, unknown>,
    ],
    [canMutate, handleActivate, handleSuspend, isUpdatingStatus, navigate],
  )

  const pageCount = data ? Math.ceil(data.total / pagination.pageSize) : 0

  return (
    <PageLayout title="Customers">
      <div className="flex flex-col gap-6">
        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-(--c-text-muted)" />
            <Input
              type="text"
              placeholder="Search by name or email..."
              value={searchInput}
              onChange={handleSearchChange}
              className="pl-9"
            />
          </div>

          <div className="flex items-center gap-2">
            <Label className="mb-0">Status</Label>
            <Select
              options={STATUS_FILTER_OPTIONS}
              value={statusFilter}
              onChange={handleStatusFilterChange}
              ariaLabel="Filter by status"
              className="min-w-48"
            />
          </div>
        </div>

        <DataTable
          columns={columns}
          data={data?.data ?? []}
          isLoading={isLoading}
          manualPagination
          pageCount={pageCount}
          totalRowCount={data?.total ?? 0}
          pagination={pagination}
          onPaginationChange={setPagination}
          manualSorting
          sorting={sorting}
          onSortingChange={onSortingChange}
          onRowDoubleClick={(row) => navigate(`/admin/customers/${row.id}`)}
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
          isLoading={isUpdatingStatus}
        />
      </div>
    </PageLayout>
  )
}
