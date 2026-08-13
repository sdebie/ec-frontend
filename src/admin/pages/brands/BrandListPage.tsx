import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {useNavigate, useSearchParams} from 'react-router-dom'
import {useBreadcrumb} from '@/admin/context/BreadcrumbContext'
import type {PaginationState, Updater} from '@tanstack/react-table'

import {useBrandList} from '@/admin/hooks/brands'
import {PageLayout, toast} from '@/shared/ui/components'
import {useAdminAuthStore} from '@/shared/auth/adminAuthStore'
import {BrandToolbar} from './components/BrandToolbar'
import {BrandTable} from './components/BrandTable'

const DEFAULT_PAGE_SIZE = 10

export function BrandListPage() {
    const navigate = useNavigate()
    const canMutate = useAdminAuthStore((s) => s.role) === 'SUPER_ADMIN'

    // Page, page size, and search live in the URL rather than component state
    // — navigating away to edit/create a brand and back (navigate(-1)) lands
    // on this same URL, restoring exactly where the user left off instead of
    // resetting to page 1. Sort is URL-persisted the same way, but owned by
    // useBrandList itself rather than here — see its sorting/onSortingChange.
    const [searchParams, setSearchParams] = useSearchParams()
    const pageIndex = Number(searchParams.get('page') ?? '0')
    const pageSize = Number(searchParams.get('pageSize') ?? String(DEFAULT_PAGE_SIZE))
    const urlSearch = searchParams.get('q') ?? ''

    const pagination = useMemo<PaginationState>(() => ({pageIndex, pageSize}), [pageIndex, pageSize])

    const [searchInput, setSearchInput] = useState(urlSearch)
    const [debouncedSearch, setDebouncedSearch] = useState(urlSearch)

    // react-table's pagination plugin keeps its own internal state alongside
    // the controlled pagination prop, and reconciles it back out via
    // onPaginationChange during mount — with ITS OWN default ({pageIndex: 0,
    // ...}), not the value we actually passed in. That reconciliation fires
    // again every time this component remounts, which is exactly what
    // navigate(-1) does when returning from edit/create — so without this
    // guard, landing back on the list silently snaps to page 0 right after
    // the URL was correctly restored. Real user interactions (clicking Next)
    // only happen well after mount. That reconciliation call is synchronous
    // within React's own render/commit/effect cycle — a plain useEffect
    // flipping the flag still runs within that same cycle (child effects
    // before parent effects) and is too early to help, so this defers one
    // macrotask via setTimeout(0), past the point where any synchronous
    // mount-time noise could possibly still be pending. useBrandList carries
    // an independent copy of this same guard for sorting's own reconciliation.
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

    // 300ms debounce for search input. Guarded on searchInput !== debouncedSearch
    // so the effect that also fires on mount (React runs effects after the
    // first render too) doesn't immediately stomp a page/sort restored from
    // the URL back to page 0 before the user has typed anything.
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

    const {data, isLoading, error, sorting, onSortingChange} = useBrandList({
        pageIndex,
        pageSize,
        search: debouncedSearch,
    })

    // Show toast on query error
    useEffect(() => {
        if (error) {
            console.error(error)
            toast.error('Failed to load brands', {duration: 0})
        }
    }, [error])

    const pageCount = data?.totalPages ?? 0

    useBreadcrumb([
        {label: 'Home', href: '/admin'},
        {label: 'Brands & Categories', href: '/admin/products/brands'},
        {label: 'Brands'},
    ])

    return (
        <PageLayout title="Brands">
            <div className="space-y-4">
                <BrandToolbar
                    searchValue={searchInput}
                    onSearchChange={setSearchInput}
                    canMutate={canMutate}
                    onCreateBrand={() => navigate('/admin/products/brands/new')}
                />

                <BrandTable
                    data={data?.content ?? []}
                    isLoading={isLoading}
                    canMutate={canMutate}
                    pageCount={pageCount}
                    pagination={pagination}
                    onPaginationChange={handlePaginationChange}
                    sorting={sorting}
                    onSortingChange={onSortingChange}
                />
            </div>
        </PageLayout>
    )
}
