import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {useNavigate, useSearchParams} from 'react-router-dom'
import {useBreadcrumb} from '@/admin/context/BreadcrumbContext'
import {Pencil, Trash2} from 'lucide-react'
import type {PaginationState, Updater} from '@tanstack/react-table'

import type {BrandListItem} from '@/admin/hooks/brands'
import {useBrandList, useDeleteBrand} from '@/admin/hooks/brands'
import type {ColumnDef} from '@/shared/ui/components'
import {ConfirmationDialog, DataTable, PageLayout, RowActionButton, Thumbnail, toast,} from '@/shared/ui/components'
import {useAdminAuthStore} from '@/shared/auth/adminAuthStore'
import {BrandToolbar} from './components/BrandToolbar'

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
                            <Thumbnail logoUrl={row.original.logoUrl} name={row.original.name} size="md"
                                       className="h-10 w-10 rounded-md shrink-0"/>
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
