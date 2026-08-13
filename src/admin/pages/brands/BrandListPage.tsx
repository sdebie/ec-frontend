import {useEffect, useMemo, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {useBreadcrumb} from '@/admin/context/BreadcrumbContext'
import {Pencil, Search, Trash2} from 'lucide-react'

import type {BrandListItem} from '@/admin/hooks/brands'
import {useBrandList, useDeleteBrand} from '@/admin/hooks/brands'
import type {ColumnDef} from '@/shared/ui/components'
import {ConfirmationDialog, DataTable, PageLayout, RowActionButton, Thumbnail, toast,} from '@/shared/ui/components'
import {Button, Input} from '@/shared/ui/primitives'
import {useAdminAuthStore} from '@/shared/auth/adminAuthStore'

export function BrandListPage() {
    const navigate = useNavigate()
    const canMutate = useAdminAuthStore((s) => s.role) === 'SUPER_ADMIN'

    const [pagination, setPagination] = useState({pageIndex: 0, pageSize: 10})
    const [searchInput, setSearchInput] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [deletingBrand, setDeletingBrand] = useState<BrandListItem | null>(null)

    // 300ms debounce for search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchInput)
            setPagination((prev) => ({...prev, pageIndex: 0}))
        }, 300)
        return () => clearTimeout(timer)
    }, [searchInput])

    const {data, isLoading, error} = useBrandList({
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
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
                enableSorting: false,
            },
            {
                accessorKey: 'slug',
                header: 'Slug',
                cell: ({row}) => (
                    <span className="text-sm text-(--c-text-muted)">{row.original.slug}</span>
                ),
                enableSorting: false,
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
                    onPaginationChange={setPagination}
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
