import {useMemo, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {Pencil, Trash2} from 'lucide-react'
import type {OnChangeFn, PaginationState, SortingState} from '@tanstack/react-table'
import type {BrandListItem} from '../types'
import {useDeleteBrand} from '../hooks/useDeleteBrand'
import type {ColumnDef} from '@/shared/ui/components'
import {ConfirmationDialog, DataTable, RowActionButton, Thumbnail, toast} from '@/shared/ui/components'

interface BrandTableProps {
    data: BrandListItem[]
    isLoading: boolean
    canMutate: boolean
    pageCount: number
    pagination: PaginationState
    onPaginationChange: OnChangeFn<PaginationState>
    sorting: SortingState
    onSortingChange: OnChangeFn<SortingState>
}

export function BrandTable({
                               data,
                               isLoading,
                               canMutate,
                               pageCount,
                               pagination,
                               onPaginationChange,
                               sorting,
                               onSortingChange,
                           }: BrandTableProps) {
    const navigate = useNavigate()
    const [deletingBrand, setDeletingBrand] = useState<BrandListItem | null>(null)
    const deleteBrand = useDeleteBrand()

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
                onRowDoubleClick={(brand) => navigate(`/admin/products/brands/${brand.id}/edit`)}
                emptyMessage="No brands found"
            />

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
        </>
    )
}
