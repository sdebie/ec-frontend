import {useEffect, useCallback, useMemo, useRef, useState} from 'react'
import {useNavigate, useSearchParams} from 'react-router-dom'
import {useBreadcrumb} from '@/admin/context/BreadcrumbContext'
import {Pencil, Search, Trash2} from 'lucide-react'
import type {PaginationState, Updater} from '@tanstack/react-table'

import type {BrandListItem} from '@/admin/hooks/brands'
import {useBrandList, useDeleteBrand} from '@/admin/hooks/brands'
import type {ColumnDef} from '@/shared/ui/components'
import {ConfirmationDialog, DataTable, PageLayout, RowActionButton, Thumbnail, toast,} from '@/shared/ui/components'
import {Button, Input} from '@/shared/ui/primitives'
import {useAdminAuthStore} from '@/shared/auth/adminAuthStore'

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
    const [deletingBrand, setDeletingBrand] = useState<BrandListItem | null>(null)

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

    const deleteBrand = useDeleteBrand()

    // Show toast on query error
    useEffect(() => {
        if (error) {
            console.error(error)
            toast.error('Failed to load brands', {duration: 0})
        }
    }, [error])

    const pageCount = data?.totalPages ?? 0

    const handleDeleteConfirm = () => {
        if (!deletingBrand) return

        deleteBrand.mutate(
            {id: deletingBrand.id},
            {
                onSuccess: () => {
                    toast.success('Brand deleted successfully')
                    setDeletingBrand(null)
                },
                onError: (err) => {
                    console.error(err)
                    toast.error('Failed to delete brand', {duration: 0})
                    setDeletingBrand(null)
                },
            },
        )
    }

    const columns: ColumnDef<BrandListItem, unknown>[] = useMemo(
        () => [
            {
                accessorKey: 'name',
                header: 'Name',
                cell: ({row}) => {
                    const description = row.original.description
                    const truncated = description && description.length > 60
                        ? `${description.slice(0, 60)}…`
                        : description
                    return (
                        <div className="flex items-center gap-3">
                            <Thumbnail logoUrl={row.original.logoUrl} name={row.original.name} size="md" className="h-10 w-10 rounded-md shrink-0" />
                            <div>
                                <div className="font-medium text-(--c-text)">{row.original.name}</div>
                                <div className="text-xs text-(--c-text-muted)">
                                    {truncated || 'No description for brand'}
                                </div>
                            </div>
                        </div>
                    )
                },
            },
            {
                accessorKey: 'slug',
                header: 'Slug',
                cell: ({row}) => (
                    <span className="text-sm text-(--c-text-muted)">{row.original.slug}</span>
                ),
            },
            {
                id: 'actions',
                header: 'Actions',
                cell: ({row}) => {
                    if (!canMutate) return null
                    return (
                        <div className="flex items-center gap-1">
                            <RowActionButton
                                onClick={() => navigate(`/admin/products/brands/${row.original.id}/edit`)}
                                aria-label={`Edit ${row.original.name}`}
                                data-testid="action-edit"
                            >
                                <Pencil className="h-4 w-4"/>
                            </RowActionButton>
                            <RowActionButton
                                onClick={() => setDeletingBrand(row.original)}
                                aria-label={`Delete ${row.original.name}`}
                                data-testid="action-delete"
                            >
                                <Trash2 className="h-4 w-4"/>
                            </RowActionButton>
                        </div>
                    )
                },
                enableSorting: false,
            },
        ],
        [canMutate, navigate],
    )

    useBreadcrumb([
        { label: 'Home', href: '/admin' },
        { label: 'Brands & Categories', href: '/admin/products/brands' },
        { label: 'Brands' },
    ])

    return (
        <PageLayout title="Brands">
            <div className="space-y-4">
                {/* Search + New Brand */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="relative flex-1 min-w-0">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-(--c-text-muted)"/>
                        <Input
                            placeholder="Search brands by name..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    {canMutate && (
                        <Button
                            variant="solid"
                            onClick={() => navigate('/admin/products/brands/new')}
                            className="w-full sm:w-auto"
                        >
                            + New Brand
                        </Button>
                    )}
                </div>

                <DataTable
                    columns={columns}
                    data={data?.content ?? []}
                    isLoading={isLoading}
                    manualPagination
                    pageCount={pageCount}
                    pagination={pagination}
                    onPaginationChange={handlePaginationChange}
                    manualSorting
                    sorting={sorting}
                    onSortingChange={onSortingChange}
                    onRowDoubleClick={(brand) => navigate(`/admin/products/brands/${brand.id}/edit`)}
                    emptyMessage="No brands found"
                />
            </div>

            <ConfirmationDialog
                open={deletingBrand !== null}
                onClose={() => setDeletingBrand(null)}
                onConfirm={handleDeleteConfirm}
                title="Delete Brand"
                description={`Are you sure you want to delete "${deletingBrand?.name}"? This action cannot be undone.`}
                confirmLabel="Delete"
                variant="danger"
                isLoading={deleteBrand.isPending}
            />
        </PageLayout>
    )
}
