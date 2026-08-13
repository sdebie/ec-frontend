import {useMemo, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {Pencil, Trash2} from 'lucide-react'
import type {OnChangeFn, PaginationState, SortingState} from '@tanstack/react-table'

import type {CategoryListItem} from '@/admin/hooks/categories'
import {useDeleteCategory} from '@/admin/hooks/categories'
import type {ColumnDef} from '@/shared/ui/components'
import {ConfirmationDialog, DataTable, RowActionButton, Thumbnail, toast} from '@/shared/ui/components'

interface CategoryTableProps {
    data: CategoryListItem[]
    isLoading: boolean
    canMutate: boolean
    pageCount: number
    pagination: PaginationState
    onPaginationChange: OnChangeFn<PaginationState>
    sorting: SortingState
    onSortingChange: OnChangeFn<SortingState>
}

export function CategoryTable({
                                  data,
                                  isLoading,
                                  canMutate,
                                  pageCount,
                                  pagination,
                                  onPaginationChange,
                                  sorting,
                                  onSortingChange,
                              }: CategoryTableProps) {

    const navigate = useNavigate()
    const [deletingCategory, setDeletingCategory] = useState<CategoryListItem | null>(null)
    const deleteCategory = useDeleteCategory()

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
                accessorKey: 'name',
                header: 'Name',
                cell: ({row}) => {
                    const description = row.original.description
                    const truncated = description && description.length > 60
                        ? `${description.slice(0, 60)}…`
                        : description
                    return (
                        <div className="flex items-center gap-3">
                            <Thumbnail logoUrl={row.original.imageUrl} name={row.original.name} size="md"
                                       className="h-10 w-10 rounded-md shrink-0"/>
                            <div>
                                <div className="font-medium text-(--c-text)">{row.original.name}</div>
                                <div className="text-xs text-(--c-text-muted)">
                                    {truncated || 'No description for category'}
                                </div>
                            </div>
                        </div>
                    )
                },
            },
            {
                id: 'parent',
                header: 'Main Category',
                cell: ({row}) => {
                    const parent = row.original.parent
                    return (
                        <span className="text-sm text-(--c-text-muted)">
                            {parent ? parent.name : 'Main Category'}
                        </span>
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

    return (
        <>
            <DataTable
                columns={columns}
                data={data}
                isLoading={isLoading}
                manualPagination
                pageCount={pageCount}
                pagination={pagination}
                onPaginationChange={onPaginationChange}
                manualSorting
                sorting={sorting}
                onSortingChange={onSortingChange}
                onRowDoubleClick={(category) => navigate(`/admin/products/categories/${category.id}/edit`)}
                emptyMessage="No categories found"
            />

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
        </>
    )
}
