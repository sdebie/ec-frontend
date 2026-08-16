import {useCallback, useEffect, useState} from 'react'
import type {PaginationState} from '@tanstack/react-table'

import {PageLayout} from '@/shared/ui/components'
import {useCan} from '@/shared/auth/adminPermissions'
import {useTableSort} from '@/admin/hooks/useTableSort'
import {useCustomers} from '../hooks/useCustomers'
import {CustomerTable} from './components/CustomerTable'
import {CustomerToolbar} from './components/CustomerToolbar'

export function CustomerListPage() {
    const canMutate = useCan('customer:write')

    const [statusFilter, setStatusFilter] = useState('ALL')
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

    const {data, isLoading} = useCustomers({
        page: pagination.pageIndex + 1,
        pageSize: pagination.pageSize,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        search: search || undefined,
        sort,
    })

    const handleStatusFilterChange = (value: string) => {
        setStatusFilter(value)
        setPagination((prev) => ({...prev, pageIndex: 0}))
    }

    const pageCount = data ? Math.ceil(data.total / pagination.pageSize) : 0

    return (
        <PageLayout title="Customers">
            <div className="flex flex-col gap-6">
                <CustomerToolbar
                    status={statusFilter}
                    onStatusChange={handleStatusFilterChange}
                    searchValue={searchInput}
                    onSearchChange={setSearchInput}
                />

                <CustomerTable
                    data={data?.data ?? []}
                    isLoading={isLoading}
                    canMutate={canMutate}
                    pageCount={pageCount}
                    totalRowCount={data?.total ?? 0}
                    pagination={pagination}
                    onPaginationChange={setPagination}
                    sorting={sorting}
                    onSortingChange={onSortingChange}
                />
            </div>
        </PageLayout>
    )
}
