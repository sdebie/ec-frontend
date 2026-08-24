import {useMemo, useState} from 'react'
import {Pencil, Trash2} from 'lucide-react'
import type {ColumnDef} from '@/shared/ui/components'
import {ConfirmationDialog, DataTable, RowActionButton, StatusBadge} from '@/shared/ui/components'
import {formatDateTime} from '@/shared/utils/formatDateTime'
import {useDeleteTestimonial} from '../hooks/useDeleteTestimonial'
import type {AdminTestimonial} from '../types'

function truncateQuote(quote: string, maxLength = 80): string {
    if (quote.length <= maxLength) return quote
    return quote.slice(0, maxLength) + '...'
}

interface TestimonialTableProps {
    data: AdminTestimonial[]
    isLoading: boolean
    canEdit: boolean
    onEdit: (testimonial: AdminTestimonial) => void
}

export function TestimonialTable({data, isLoading, canEdit, onEdit}: TestimonialTableProps) {
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const deleteTestimonial = useDeleteTestimonial()

    const handleDeleteConfirm = () => {
        if (!deletingId) return
        deleteTestimonial.mutate(deletingId, {
            onSuccess: () => setDeletingId(null),
        })
    }

    const columns: ColumnDef<AdminTestimonial, unknown>[] = useMemo(() => {
        const cols: ColumnDef<AdminTestimonial, unknown>[] = [
            {
                id: 'quote',
                header: 'Quote',
                cell: ({row}) => (
                    <span className="text-(--c-text)" title={row.original.quote}>
            {truncateQuote(row.original.quote)}
          </span>
                ),
                enableSorting: false,
            },
            {
                id: 'author',
                header: 'Author',
                cell: ({row}) => (
                    <span className="text-(--c-text)">{row.original.authorName}</span>
                ),
                enableSorting: false,
            },
            {
                id: 'published',
                header: 'Published',
                cell: ({row}) => (
                    <StatusBadge
                        label={row.original.published ? 'Published' : 'Draft'}
                        color={row.original.published ? 'green' : 'gray'}
                    />
                ),
                enableSorting: false,
            },
            {
                id: 'sortOrder',
                header: 'Sort Order',
                cell: ({row}) => (
                    <span className="text-(--c-text)">{row.original.sortOrder}</span>
                ),
                enableSorting: false,
            },
            {
                id: 'updatedAt',
                header: 'Last Updated',
                cell: ({row}) => (
                    <span className="text-(--c-text)">{formatDateTime(row.original.updatedAt)}</span>
                ),
                enableSorting: false,
            },
        ]

        if (canEdit) {
            cols.push({
                id: 'actions',
                header: 'Actions',
                cell: ({row}) => (
                    <div className="flex items-center gap-1">
                        <RowActionButton
                            onClick={() => onEdit(row.original)}
                            aria-label={`Edit testimonial by ${row.original.authorName}`}
                        >
                            <Pencil className="h-4 w-4"/>
                        </RowActionButton>
                        <RowActionButton
                            variant="danger"
                            onClick={() => setDeletingId(row.original.id)}
                            aria-label={`Delete testimonial by ${row.original.authorName}`}
                        >
                            <Trash2 className="h-4 w-4"/>
                        </RowActionButton>
                    </div>
                ),
                enableSorting: false,
            })
        }

        return cols
    }, [canEdit, onEdit])

    return (
        <>
            <DataTable
                columns={columns}
                data={data}
                isLoading={isLoading}
                emptyMessage="No testimonials yet. Add your first testimonial to display on the storefront."
                onRowDoubleClick={onEdit}
            />

            <ConfirmationDialog
                open={deletingId !== null}
                onClose={() => setDeletingId(null)}
                onConfirm={handleDeleteConfirm}
                title="Delete Testimonial"
                description="Are you sure you want to delete this testimonial? This action cannot be undone."
                confirmLabel="Delete"
                cancelLabel="Cancel"
                variant="danger"
                isLoading={deleteTestimonial.isPending}
            />
        </>
    )
}
