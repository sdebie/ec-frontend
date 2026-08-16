import {useState} from 'react'
import type {PaginationState} from '@tanstack/react-table'
import {DateRangePreset, PageLayout, resolveDateRange} from '@/shared/ui/components'
import {useWholesaleApplications} from './hooks/useWholesaleApplications'
import {useTableSort} from '@/admin/hooks/useTableSort'
import {WholesaleApplicationQueueToolbar} from './components/WholesaleApplicationQueueToolbar'
import {WholesaleApplicationQueueTable} from './components/WholesaleApplicationQueueTable'

export function WholesaleApplicationQueuePage() {
    const [statusFilter, setStatusFilter] = useState('PENDING')
    const [datePreset, setDatePreset] = useState<DateRangePreset>(DateRangePreset.ALL)
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    })

    const {sorting, onSortingChange, sort} = useTableSort({field: 'createdAt', desc: true})

    /*
      Resolved on every render rather than stored, so "Today" still means today on a page
      left open overnight — see OrderListPage's identical comment.
    */
    const {fromDate, toDate} = resolveDateRange(datePreset)

    const {data, total, isLoading} = useWholesaleApplications({
        page: pagination.pageIndex + 1,
        pageSize: pagination.pageSize,
        status: statusFilter === 'ALL' ? undefined : (statusFilter as 'PENDING' | 'APPROVED' | 'REJECTED'),
        fromDate,
        toDate,
        sort,
    })

    const handleStatusFilterChange = (value: string) => {
        setStatusFilter(value)
        setPagination((prev) => ({...prev, pageIndex: 0}))
    }

    const handleDatePresetChange = (value: DateRangePreset) => {
        setDatePreset(value)
        setPagination((prev) => ({...prev, pageIndex: 0}))
    }

    const pageCount = total ? Math.ceil(total / pagination.pageSize) : 0

    return (
        <PageLayout title="Wholesale Applications">
            <div className="flex flex-col gap-6">
                <WholesaleApplicationQueueToolbar
                    status={statusFilter}
                    onStatusChange={handleStatusFilterChange}
                    datePreset={datePreset}
                    onDatePresetChange={handleDatePresetChange}
                />
                <WholesaleApplicationQueueTable
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
