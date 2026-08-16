import { useState, useEffect, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import type { PaginationState } from '@tanstack/react-table'

import { EllipsisVertical, Search } from 'lucide-react'

import {
  DataTable,
  Segment,
  ConfirmationDialog,
  StatusBadge,
  DropdownMenu,
  DropdownItem,
  RowActionButton,
} from '@/shared/ui/components'
import type { ColumnDef } from '@/shared/ui/components'
import { Input } from '@/shared/ui/primitives'
import { useCan } from '@/shared/auth/adminPermissions'
import { useTableSort } from '@/admin/hooks/useTableSort'
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
  const canMutate = useCan('wholesale-customer:write')

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

  const { mutate: updateWholesaleCustomerStatus, isPending: isUpdatingStatus } = useWholesaleCustomerStatusAction()

  const { data, total, isLoading } = useWholesaleCustomers({
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    status: statusFilter === 'ALL' ? undefined : statusFilter,
    search: search || undefined,
    sort,
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
        // Not sortable: concatenates firstName + lastName, no single backend field.
        id: 'name',
        header: 'Name',
        enableSorting: false,
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
        // accessorKey stays 'email' (the flattened DTO field, needed for TanStack to
        // treat the header as clickable); id is overridden to 'user.email', the real
        // column — email lives on the linked UserEntity, and that id is sent to the
        // server unmodified as the sort key.
        accessorKey: 'email',
        id: 'user.email',
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
        // Not sortable: resolved per row from a separate WholesaleApplicationEntity
        // lookup (CustomerAdminService.wholesaleApplicationFor), not a JPQL property on
        // CustomerEntity — there is no column here to sort by.
        id: 'wholesaleApplicationStatus',
        header: 'Application Status',
        enableSorting: false,
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
        // Same accessorKey/id split as email: registeredAt is customer.user.createdAt.
        accessorKey: 'registeredAt',
        id: 'user.createdAt',
        header: 'Registered Date',
        cell: ({ row }) => formatDate(row.original.registeredAt),
      },
      ...(canMutate
        ? [
            {
              id: 'actions',
              header: 'Actions',
              enableSorting: false,
              cell: ({ row }: { row: { original: WholesaleCustomerListItem } }) => {
                const customer = row.original
                const actions = getAvailableActions(customer.status)
                if (actions.length === 0) return null
                return (
                  <DropdownMenu
                    trigger={
                      <RowActionButton
                        as="span"
                        className={isUpdatingStatus ? 'opacity-50 pointer-events-none' : undefined}
                      >
                        <EllipsisVertical className="h-5 w-5" />
                      </RowActionButton>
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
      </div>

      <DataTable
        columns={columns}
        data={data ?? []}
        isLoading={isLoading}
        manualPagination
        pageCount={pageCount}
        totalRowCount={total ?? 0}
        pagination={pagination}
        onPaginationChange={setPagination}
        manualSorting
        sorting={sorting}
        onSortingChange={onSortingChange}
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
