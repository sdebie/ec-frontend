import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import type { PaginationState } from '@tanstack/react-table'
import { Eye } from 'lucide-react'

import {
  DataTable,
  RowActionButton,
  Segment,
  StatusBadge,
} from '@/shared/ui/components'
import type { ColumnDef } from '@/shared/ui/components'
import { useWholesaleApplications } from '@/admin/hooks/wholesale'
import type { WholesaleApplicationListItem } from '@/admin/hooks/wholesale'
import { getWholesaleStatusColor } from '@/admin/hooks/customers/types'
import { useTableSort } from '@/admin/hooks/useTableSort'

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
  const navigate = useNavigate()

  const [statusFilter, setStatusFilter] = useState('PENDING')
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const { sorting, onSortingChange, sort } = useTableSort()

  const { data, total, isLoading } = useWholesaleApplications({
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    status: statusFilter === 'ALL' ? undefined : (statusFilter as 'PENDING' | 'APPROVED' | 'REJECTED'),
    sort,
  })

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value)
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }

  const columns = useMemo<ColumnDef<WholesaleApplicationListItem, unknown>[]>(
    () => [
      {
        // Not sortable: this cell concatenates firstName + lastName, and there is no
        // single backend field a "full name" sort could map to.
        id: 'name',
        header: 'Name',
        enableSorting: false,
        cell: ({ row }) => (
          <span>
            {row.original.firstName} {row.original.lastName}
          </span>
        ),
      },
      {
        // Not sortable: the entity's email fields are applicantEmail/accountEmail — this
        // column's accessorKey ('email') is the flattened DTO name and does not match
        // either, so sending it as a sort key would fail server-side.
        id: 'email',
        header: 'Email',
        accessorKey: 'email',
        enableSorting: false,
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
      {
        id: 'actions',
        header: 'Actions',
        enableSorting: false,
        cell: ({ row }) => (
          <RowActionButton
            onClick={() => navigate(`/admin/wholesale/applications/${row.original.id}`)}
            aria-label="View application"
            data-testid="action-view"
          >
            <Eye className="h-4 w-4" />
          </RowActionButton>
        ),
      },
    ],
    [navigate],
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
    </div>
  )
}
