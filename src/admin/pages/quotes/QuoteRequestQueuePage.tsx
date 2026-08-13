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
import { useQuoteRequests } from '@/admin/hooks/quotes'
import type { QuoteRequestListItem } from '@/admin/hooks/quotes'
import {
  QuoteRequestStatusOptions,
  type QuoteRequestStatus,
} from '@/shared/types/enums'

const STATUS_FILTER_OPTIONS = [
  { value: 'ALL', label: 'All' },
  { value: 'NEW', label: 'New' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'CLOSED', label: 'Closed' },
]

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function QuoteRequestQueuePage() {
  const navigate = useNavigate()

  const [statusFilter, setStatusFilter] = useState<QuoteRequestStatus | 'ALL'>('ALL')
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const { data, total, isLoading } = useQuoteRequests({
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    status: statusFilter,
  })

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value as QuoteRequestStatus | 'ALL')
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }

  const columns = useMemo<ColumnDef<QuoteRequestListItem, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
      },
      {
        accessorKey: 'company',
        header: 'Company',
        cell: ({ row }) => row.original.company ?? '—',
      },
      {
        accessorKey: 'itemCount',
        header: 'Items',
      },
      {
        accessorKey: 'createdAt',
        header: 'Submitted Date',
        cell: ({ row }) => formatDate(row.original.createdAt),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const statusOption = QuoteRequestStatusOptions[row.original.status]
          return (
            <StatusBadge
              label={statusOption.label}
              color={statusOption.color}
            />
          )
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <RowActionButton
            onClick={() => navigate(`/admin/quotes/${row.original.id}`)}
            aria-label="View quote request"
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
      <h1 className="text-2xl font-semibold text-(--c-text)">Quote Requests</h1>

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
        pagination={pagination}
        onPaginationChange={setPagination}
      />
    </div>
  )
}
