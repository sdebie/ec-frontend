import {useCallback, useState} from 'react'
import type {PaginationState} from '@tanstack/react-table'

import {DateRangePreset, PageLayout, resolveDateRange} from '@/shared/ui/components'
import {useCan} from '@/shared/auth/adminPermissions'
import {useTableSort} from '@/admin/hooks/useTableSort'
import {useOrders} from './hooks/useOrders'
import type {OrderListFilters} from './components/OrderListToolbar'
import {OrderListToolbar} from './components/OrderListToolbar'
import {OrderTable} from './components/OrderTable'

const NO_FILTERS: OrderListFilters = {
    paymentState: 'ALL',
    fulfilmentState: 'ALL',
    datePreset: DateRangePreset.ALL,
}

/** `'ALL'` is the UI's "no filter" sentinel — it must never reach the backend. */
const asArgument = (value: string) => (value === 'ALL' ? undefined : value)

export function OrderListPage() {
    const canMutate = useCan('order:write')

    const [filters, setFilters] = useState<OrderListFilters>(NO_FILTERS)
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    })

    const {sorting, onSortingChange: onSortingChangeUrl, sort} = useTableSort()

    /*
      useTableSort resets `page` in the URL on a sort change, which is a no-op here — this
      page's pagination is local component state, not URL-driven, unlike Brands/Categories.
      The reset has to happen the same way a filter change resets it: explicitly, alongside
      the URL write.
    */
    const onSortingChange: typeof onSortingChangeUrl = useCallback(
        (updater) => {
            onSortingChangeUrl(updater)
            setPagination((prev) => ({...prev, pageIndex: 0}))
        },
        [onSortingChangeUrl],
    )

    /**
     * Narrowing the list invalidates the page along with it: page 3 of the old result set
     * is not page 3 of the new one, and staying there strands the reader on a page that
     * may no longer exist.
     */
    const handleFiltersChange = useCallback((patch: Partial<OrderListFilters>) => {
        setFilters((prev) => ({...prev, ...patch}))
        setPagination((prev) => ({...prev, pageIndex: 0}))
    }, [])

    /*
      Resolved on every render rather than stored, so "Today" still means today on a page
      left open overnight. The result is date-granular, so it is the same value all day and
      the query key stays stable until it genuinely should change.
    */
    const {fromDate, toDate} = resolveDateRange(filters.datePreset)

    const {data, isLoading} = useOrders({
        page: pagination.pageIndex + 1,
        pageSize: pagination.pageSize,
        paymentState: asArgument(filters.paymentState),
        fulfilmentState: asArgument(filters.fulfilmentState),
        fromDate,
        toDate,
        sort,
    })

    const pageCount = data ? Math.ceil(data.total / pagination.pageSize) : 0

    return (
        <PageLayout title="Orders">
            <div className="flex flex-col gap-6">
                <OrderListToolbar filters={filters} onChange={handleFiltersChange}/>

                <OrderTable
                    data={data?.data ?? []}
                    isLoading={isLoading}
                    canMutate={canMutate}
                    pageCount={pageCount}
                    pagination={pagination}
                    onPaginationChange={setPagination}
                    sorting={sorting}
                    onSortingChange={onSortingChange}
                />
            </div>
        </PageLayout>
    )
}
