import {useCallback, useEffect, useState} from 'react'
import type {PaginationState} from '@tanstack/react-table'
import {PageLayout} from '@/shared/ui/components'
import {useCan} from '@/shared/auth/adminPermissions'
import {useTableSort} from '@/admin/hooks/useTableSort'
import type {CustomerStatus} from '@/admin/hooks/customers/types'
import {useWholesaleCustomers} from './hooks'
import {WholesaleCustomerListToolbar} from './components/WholesaleCustomerListToolbar'
import {WholesaleCustomerListTable} from './components/WholesaleCustomerListTable'

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
            setPagination((prev) => ({...prev, pageIndex: 0}))
        }, 300)
        return () => clearTimeout(t)
    }, [searchInput])

    const {sorting, onSortingChange: onSortingChangeUrl, sort} = useTableSort()

    // useTableSort resets `page` in the URL on a sort change, which is a no-op here —
    // this page's pagination is local component state, not URL-driven. The reset has
    // to happen explicitly, the same way it does for the status filter and search.
    const onSortingChange: typeof onSortingChangeUrl = useCallback(
        (updater) => {
            onSortingChangeUrl(updater)
            setPagination((prev) => ({...prev, pageIndex: 0}))
        },
        [onSortingChangeUrl],
    )

    const {data, total, isLoading} = useWholesaleCustomers({
        page: pagination.pageIndex + 1,
        pageSize: pagination.pageSize,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        search: search || undefined,
        sort,
    })

    const handleStatusFilterChange = (value: string) => {
        setStatusFilter(value as CustomerStatus | 'ALL')
        setPagination((prev) => ({...prev, pageIndex: 0}))
    }

    const pageCount = total ? Math.ceil(total / pagination.pageSize) : 0

    return (
        <PageLayout title="Wholesale Customers">
            <div className="flex flex-col gap-6">
                <WholesaleCustomerListToolbar
                    status={statusFilter}
                    onStatusChange={handleStatusFilterChange}
                    searchValue={searchInput}
                    onSearchChange={setSearchInput}
                />
                <WholesaleCustomerListTable
                    data={data ?? []}
                    isLoading={isLoading}
                    canMutate={canMutate}
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
