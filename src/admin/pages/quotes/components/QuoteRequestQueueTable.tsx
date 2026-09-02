import {useMemo} from 'react'
import {useNavigate} from 'react-router-dom'
import type {OnChangeFn, PaginationState, SortingState} from '@tanstack/react-table'
import {Eye} from 'lucide-react'
import type {ColumnDef} from '@/shared/ui/components'
import {DataTable, QuoteRequestStatusDisplay, RowActionButton} from '@/shared/ui/components'
import {formatDateTime} from '@/shared/utils/formatDateTime'
import type {QuoteRequestListItem} from '../hooks/useQuoteRequests'

interface QuoteRequestQueueTableProps {
    data: QuoteRequestListItem[]
    isLoading: boolean
    pageCount: number
    totalRowCount: number
    pagination: PaginationState
    onPaginationChange: OnChangeFn<PaginationState>
    sorting: SortingState
    onSortingChange: OnChangeFn<SortingState>
}

export function QuoteRequestQueueTable({
                                           data,
                                           isLoading,
                                           pageCount,
                                           totalRowCount,
                                           pagination,
                                           onPaginationChange,
                                           sorting,
                                           onSortingChange,
                                       }: QuoteRequestQueueTableProps) {
    const navigate = useNavigate()

    const columns = useMemo<ColumnDef<QuoteRequestListItem, unknown>[]>(
        () => [
            {
                accessorKey: 'createdAt',
                header: 'Submitted Date',
                cell: ({row}) => formatDateTime(row.original.createdAt),
            },
            {
                accessorKey: 'name',
                header: 'Name',
            },
            {
                accessorKey: 'company',
                header: 'Company',
                cell: ({row}) => row.original.company ?? '—',
            },
            {
                // Not sortable: itemCount is a mapper-computed count of the request's line items,
                // not a column on QuoteRequestEntity — there is no server field for it to sort by.
                accessorKey: 'itemCount',
                header: 'Items',
                enableSorting: false,
            },
            {
                accessorKey: 'status',
                header: 'Status',
                cell: ({row}) => <QuoteRequestStatusDisplay status={row.original.status}/>,
            },
            {
                id: 'actions',
                header: 'Actions',
                enableSorting: false,
                cell: ({row}) => (
                    <RowActionButton
                        onClick={() => navigate(`/admin/quotes/${row.original.id}`)}
                        aria-label="View quote request"
                        data-testid="action-view"
                    >
                        <Eye className="h-4 w-4"/>
                    </RowActionButton>
                ),
            },
        ],
        [navigate],
    )

    return (
        <DataTable
            columns={columns}
            data={data}
            isLoading={isLoading}
            manualPagination
            pageCount={pageCount}
            totalRowCount={totalRowCount}
            pagination={pagination}
            onPaginationChange={onPaginationChange}
            manualSorting
            sorting={sorting}
            onSortingChange={onSortingChange}
            onRowDoubleClick={(row) => navigate(`/admin/quotes/${row.id}`)}
        />
    )
}
