import {useCallback, useState} from 'react'
import type {PaginationState} from '@tanstack/react-table'

import {PageLayout} from '@/shared/ui/components'
import {useCan} from '@/shared/auth/adminPermissions'
import {useOrders} from './hooks/useOrders'
import type {OrderListFilters} from './components/OrderListToolbar'
import {OrderListToolbar} from './components/OrderListToolbar'
import {OrderTable} from './components/OrderTable'

const NO_FILTERS: OrderListFilters = {
    paymentState: 'ALL',
    fulfilmentState: 'ALL',
    fromDate: '',
    toDate: '',
}

/** `'ALL'`/`''` are the UI's "no filter" sentinels — neither may reach the backend. */
const asArgument = (value: string) => (value && value !== 'ALL' ? value : undefined)

export function OrderListPage() {
    const canMutate = useCan('order:write')

    const [filters, setFilters] = useState<OrderListFilters>(NO_FILTERS)
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    })

    /**
     * Narrowing the list invalidates the page along with it: page 3 of the old result set
     * is not page 3 of the new one, and staying there strands the reader on a page that
     * may no longer exist.
     */
    const handleFiltersChange = useCallback((patch: Partial<OrderListFilters>) => {
        setFilters((prev) => ({...prev, ...patch}))
        setPagination((prev) => ({...prev, pageIndex: 0}))
    }, [])

    const {data, isLoading} = useOrders({
        page: pagination.pageIndex + 1,
        pageSize: pagination.pageSize,
        paymentState: asArgument(filters.paymentState),
        fulfilmentState: asArgument(filters.fulfilmentState),
        fromDate: asArgument(filters.fromDate),
        toDate: asArgument(filters.toDate),
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
                />
            </div>
        </PageLayout>
    )
}
