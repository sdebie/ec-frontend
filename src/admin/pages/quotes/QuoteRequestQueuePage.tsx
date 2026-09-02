import {useState} from 'react'
import type {PaginationState} from '@tanstack/react-table'
import {PageLayout} from '@/shared/ui/components'
import {useQuoteRequests} from './hooks/useQuoteRequests'
import {useTableSort} from '@/admin/hooks/useTableSort'
import {QuoteRequestQueueToolbar} from './components/QuoteRequestQueueToolbar'
import {QuoteRequestQueueTable} from './components/QuoteRequestQueueTable'
import type {QuoteRequestStatus} from '@/shared/types/enums'

export function QuoteRequestQueuePage() {
    const [statusFilter, setStatusFilter] = useState<QuoteRequestStatus | 'ALL'>('ALL')
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    })

    const {sorting, onSortingChange, sort} = useTableSort()

    const {data, total, isLoading} = useQuoteRequests({
        page: pagination.pageIndex + 1,
        pageSize: pagination.pageSize,
        status: statusFilter,
        sort,
    })

    const handleStatusFilterChange = (value: string) => {
        setStatusFilter(value as QuoteRequestStatus | 'ALL')
        setPagination((prev) => ({...prev, pageIndex: 0}))
    }

    const pageCount = total ? Math.ceil(total / pagination.pageSize) : 0

    return (
        <PageLayout title="Quote Requests">
            <div className="flex flex-col gap-6">
                <QuoteRequestQueueToolbar
                    status={statusFilter}
                    onStatusChange={handleStatusFilterChange}
                />

                <QuoteRequestQueueTable
                    data={data ?? []}
                    isLoading={isLoading}
                    pageCount={pageCount}
                    totalRowCount={total ?? 0}
                    pagination={pagination}
                    onPaginationChange={setPagination}
                    sorting={sorting}
                    onSortingChange={onSortingChange}
                />
            </div>
        </PageLayout>
    )
}
