import {useEffect, useMemo, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {useBreadcrumb} from '@/admin/context/BreadcrumbContext'
import {Pencil, Search, Trash2} from 'lucide-react'

import type {BrandListItem} from '@/admin/hooks/brands'
import {useBrandList, useDeleteBrand} from '@/admin/hooks/brands'
import type {ColumnDef} from '@/shared/ui/components'
import {ConfirmationDialog, DataTable, PageLayout, Thumbnail, toast,} from '@/shared/ui/components'
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
                id: 'thumbnail',
                header: 'Icon',
                cell: ({row}) => (
                    <Thumbnail logoUrl={row.original.logoUrl} name={row.original.name} size="md" className="h-10 w-10 rounded-md" />
                ),
                enableSorting: false,
            },
            {
                accessorKey: 'name',
                header: 'Name',
                cell: ({row}) => (
                    <span className="font-medium text-(--c-text)">{row.original.name}</span>
                ),
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
                id: 'description',
                header: 'Description',
                cell: ({row}) => {
                    const desc = row.original.description
                    if (!desc) return <span className="text-sm text-(--c-text-muted)">—</span>
                    const truncated = desc.length > 60 ? `${desc.slice(0, 60)}…` : desc
                    return <span className="text-sm text-(--c-text-muted)">{truncated}</span>
                },
                enableSorting: false,
            },
            {
                id: 'actions',
                header: 'Actions',
                cell: ({row}) => {
                    if (!canMutate) return null
                    return (
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={() => navigate(`/admin/products/brands/${row.original.id}/edit`)}
                                className="inline-flex items-center justify-center p-1 rounded-lg hover:bg-(--c-surface-hover)"
                                aria-label={`Edit ${row.original.name}`}
                                data-testid="action-edit"
                            >
                                <Pencil className="h-4 w-4 text-(--c-text-muted)"/>
                            </button>
                            <button
                                type="button"
                                onClick={() => setDeletingBrand(row.original)}
                                className="inline-flex items-center justify-center p-1 rounded-lg hover:bg-(--c-surface-hover)"
                                aria-label={`Delete ${row.original.name}`}
                                data-testid="action-delete"
                            >
                                <Trash2 className="h-4 w-4 text-(--c-text-muted)"/>
                            </button>
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
        { label: 'Products', href: '/admin/products' },
        { label: 'Brands' },
    ])

    const headerAction = canMutate ? (
        <Button variant="solid" onClick={() => navigate('/admin/products/brands/new')}>
            + New Brand
        </Button>
    ) : undefined

    return (
        <PageLayout title="Brands" action={headerAction}>
            <div className="space-y-4">
                {/* Search Bar */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-50">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-(--c-text-muted)"/>
                        <Input
                            placeholder="Search brands by name..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                </div>

                <DataTable
                    columns={columns}
                    data={data?.content ?? []}
                    isLoading={isLoading}
                    manualPagination
                    pageCount={pageCount}
                    pagination={pagination}
                    onPaginationChange={setPagination}
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
