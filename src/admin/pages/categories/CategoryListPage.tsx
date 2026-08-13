import {useEffect, useMemo, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {useBreadcrumb} from '@/admin/context/BreadcrumbContext'
import {Pencil, Search, Trash2} from 'lucide-react'
import type {CategoryListItem} from '@/admin/hooks/categories'
import {useCategoryList, useDeleteCategory} from '@/admin/hooks/categories'
import type {ColumnDef} from '@/shared/ui/components'
import {ConfirmationDialog, DataTable, PageLayout, RowActionButton, Thumbnail, toast,} from '@/shared/ui/components'
import {Button, Input} from '@/shared/ui/primitives'
import {useAdminAuthStore} from '@/shared/auth/adminAuthStore'

export function CategoryListPage() {

    const navigate = useNavigate()
    const canMutate = useAdminAuthStore((s) => s.role) === 'SUPER_ADMIN'
    const [pagination, setPagination] = useState({pageIndex: 0, pageSize: 10})
    const [searchInput, setSearchInput] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [deletingCategory, setDeletingCategory] = useState<CategoryListItem | null>(null)

    // 300ms debounce for search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchInput)
            setPagination((prev) => ({...prev, pageIndex: 0}))
        }, 300)
        return () => clearTimeout(timer)
    }, [searchInput])

    const {data, isLoading, error} = useCategoryList({
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
        search: debouncedSearch,
    })

    const deleteCategory = useDeleteCategory()

    // Show toast on query error
    useEffect(() => {
        if (error) {
            console.error(error)
            toast.error('Failed to load categories', {duration: 0})
        }
    }, [error])

    const pageCount = data?.totalPages ?? 0

    const handleDeleteConfirm = () => {
        if (!deletingCategory) return

        deleteCategory.mutate(
            {id: deletingCategory.id},
            {
                onSuccess: () => {
                    toast.success('Category deleted successfully')
                    setDeletingCategory(null)
                },
                onError: (err) => {
                    console.error(err)
                    toast.error('Failed to delete category', {duration: 0})
                    setDeletingCategory(null)
                },
            },
        )
    }

    const columns: ColumnDef<CategoryListItem, unknown>[] = useMemo(
        () => [
            {
                id: 'thumbnail',
                header: 'Icon',
                cell: ({row}) => (
                    <Thumbnail logoUrl={row.original.imageUrl} name={row.original.name} size="md"
                               className="h-10 w-10 rounded-md"/>
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
                id: 'parent',
                header: 'Parent',
                cell: ({row}) => {
                    const parent = row.original.parent
                    return (
                        <span className="text-sm text-(--c-text-muted)">
                            {parent ? parent.name : '—'}
                        </span>
                    )
                },
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
                            <RowActionButton
                                onClick={() => navigate(`/admin/products/categories/${row.original.id}/edit`)}
                                aria-label={`Edit ${row.original.name}`}
                                data-testid="action-edit"
                            >
                                <Pencil className="h-4 w-4"/>
                            </RowActionButton>
                            <RowActionButton
                                onClick={() => setDeletingCategory(row.original)}
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
        {label: 'Categories'},
    ])

    const headerAction = canMutate ? (
        <Button variant="solid" onClick={() => navigate('/admin/products/categories/new')}>
            + New Category
        </Button>
    ) : undefined

    return (
        <PageLayout title="Categories" action={headerAction}>
            <div className="space-y-4">
                {/* Search Bar */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-50">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-(--c-text-muted)"/>
                        <Input
                            placeholder="Search categories by name..."
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
                    emptyMessage="No categories found"
                />
            </div>

            <ConfirmationDialog
                open={deletingCategory !== null}
                onClose={() => setDeletingCategory(null)}
                onConfirm={handleDeleteConfirm}
                title="Delete Category"
                description={`Are you sure you want to delete "${deletingCategory?.name}"? This action cannot be undone.`}
                confirmLabel="Delete"
                variant="danger"
                isLoading={deleteCategory.isPending}
            />
        </PageLayout>
    )
}
