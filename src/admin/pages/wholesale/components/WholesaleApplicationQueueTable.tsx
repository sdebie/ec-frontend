import {useMemo} from 'react'
import {useNavigate} from 'react-router-dom'
import type {OnChangeFn, PaginationState, SortingState} from '@tanstack/react-table'
import {Eye} from 'lucide-react'
import type {ColumnDef} from '@/shared/ui/components'
import {DataTable, RowActionButton, WholesaleApplicationStatusDisplay} from '@/shared/ui/components'
import {formatDateTime} from '@/shared/utils/formatDateTime'
import {maskEmail} from '@/shared/utils/maskEmail'
import type {WholesaleApplicationListItem} from '../hooks'

interface WholesaleApplicationQueueTableProps {
    data: WholesaleApplicationListItem[]
    isLoading: boolean
    pageCount: number
    totalRowCount: number
    pagination: PaginationState
    onPaginationChange: OnChangeFn<PaginationState>
    sorting: SortingState
    onSortingChange: OnChangeFn<SortingState>
}

export function WholesaleApplicationQueueTable({
                                                   data,
                                                   isLoading,
                                                   pageCount,
                                                   totalRowCount,
                                                   pagination,
                                                   onPaginationChange,
                                                   sorting,
                                                   onSortingChange,
                                               }: WholesaleApplicationQueueTableProps) {
    const navigate = useNavigate()

    const columns = useMemo<ColumnDef<WholesaleApplicationListItem, unknown>[]>(
        () => [
            {
                accessorKey: 'createdAt',
                header: 'Submitted Date',
                cell: ({row}) => (
                    <span className="whitespace-nowrap">
                        {formatDateTime(row.original.createdAt)}
                    </span>
                ),
            },
            {
                // Not sortable: this cell concatenates firstName + lastName, and there is no
                // single backend field a "full name" sort could map to.
                id: 'name',
                header: 'Name',
                enableSorting: false,
                cell: ({row}) => (
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
                enableSorting: false,
                cell: ({row}) => <span>{maskEmail(row.original.email)}</span>,
            },
            {
                accessorKey: 'status',
                header: 'Status',
                cell: ({row}) => <WholesaleApplicationStatusDisplay status={row.original.status}/>,
            },
            {
                id: 'actions',
                header: 'Actions',
                enableSorting: false,
                cell: ({row}) => (
                    <RowActionButton
                        onClick={() => navigate(`/admin/wholesale/applications/${row.original.id}`)}
                        aria-label="View application"
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
            onRowDoubleClick={(row) => navigate(`/admin/wholesale/applications/${row.id}`)}
        />
    )
}
