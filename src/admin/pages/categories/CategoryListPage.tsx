import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {useNavigate, useSearchParams} from 'react-router-dom'
import {useBreadcrumb} from '@/admin/context/BreadcrumbContext'
import type {PaginationState, Updater} from '@tanstack/react-table'

import {useCategoryList} from './hooks/useCategoryList'
import {PageLayout, toast} from '@/shared/ui/components'
import {useCan} from '@/shared/auth/adminPermissions'
import {CategoryToolbar} from './components/CategoryToolbar'
import {CategoryTable} from './components/CategoryTable'

const DEFAULT_PAGE_SIZE = 10

export function CategoryListPage() {

    const navigate = useNavigate()
    const canMutate = useCan('category:write')
    const [searchParams, setSearchParams] = useSearchParams()
    const pageIndex = Number(searchParams.get('page') ?? '0')
    const pageSize = Number(searchParams.get('pageSize') ?? String(DEFAULT_PAGE_SIZE))
    const urlSearch = searchParams.get('q') ?? ''
    const pagination = useMemo<PaginationState>(() => ({pageIndex, pageSize}), [pageIndex, pageSize])
    const [searchInput, setSearchInput] = useState(urlSearch)
    const [debouncedSearch, setDebouncedSearch] = useState(urlSearch)

    const hasMountedRef = useRef(false)
    useEffect(() => {
        const id = setTimeout(() => {
            hasMountedRef.current = true
        }, 0)
        return () => clearTimeout(id)
    }, [])

    const handlePaginationChange = useCallback((updater: Updater<PaginationState>) => {
        if (!hasMountedRef.current) return
        const next = typeof updater === 'function' ? updater(pagination) : updater
        setSearchParams((prev) => {
            const params = new URLSearchParams(prev)
            params.set('page', String(next.pageIndex))
            params.set('pageSize', String(next.pageSize))
            return params
        })
    }, [pagination, setSearchParams])

    useEffect(() => {
        if (searchInput === debouncedSearch) return
        const timer = setTimeout(() => {
            setDebouncedSearch(searchInput)
            setSearchParams((prev) => {
                const params = new URLSearchParams(prev)
                if (searchInput.trim()) params.set('q', searchInput)
                else params.delete('q')
                params.set('page', '0')
                return params
            })
        }, 300)
        return () => clearTimeout(timer)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchInput])

    const {data, isLoading, error, sorting, onSortingChange} = useCategoryList({
        pageIndex,
        pageSize,
        search: debouncedSearch,
    })

    // Show toast on query error
    useEffect(() => {
        if (error) {
            console.error(error)
            toast.error('Failed to load categories', {duration: 0})
        }
    }, [error])

    const pageCount = data?.totalPages ?? 0

    useBreadcrumb([
        {label: 'Home', href: '/admin'},
        {label: 'Brands & Categories', href: '/admin/products/brands'},
        {label: 'Categories'},
    ])

    return (
        <PageLayout title="Categories">
            <div className="space-y-4">
                <CategoryToolbar
                    searchValue={searchInput}
                    onSearchChange={setSearchInput}
                    canMutate={canMutate}
                    onCreateCategory={() => navigate('/admin/products/categories/new')}
                />

                <CategoryTable
                    data={data?.content ?? []}
                    isLoading={isLoading}
                    canMutate={canMutate}
                    pageCount={pageCount}
                    totalRowCount={data?.totalElements ?? 0}
                    pagination={pagination}
                    onPaginationChange={handlePaginationChange}
                    sorting={sorting}
                    onSortingChange={onSortingChange}
                />
            </div>
        </PageLayout>
    )
}
