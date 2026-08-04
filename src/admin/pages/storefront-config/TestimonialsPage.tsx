import { useCallback, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Pencil, Plus, Trash2 } from 'lucide-react'

import {
  useAdminTestimonials,
  useCreateTestimonial,
  useUpdateTestimonial,
  useDeleteTestimonial,
  testimonialFormSchema,
  type TestimonialFormData,
  type AdminTestimonial,
} from '@/admin/hooks/testimonials'
import type { ColumnDef } from '@/shared/ui/components'
import {
  DataTable,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  PageLayout,
  StatusBadge,
} from '@/shared/ui/components'
import { ConfirmationDialog } from '@/shared/ui/components/dialog/ConfirmationDialog'
import { Button, Input } from '@/shared/ui/primitives'
import { hasRequiredAuthority } from '@/shared/utils/authorizationHelper'

function truncateQuote(quote: string, maxLength = 80): string {
  if (quote.length <= maxLength) return quote
  return quote.slice(0, maxLength) + '...'
}

export function TestimonialsPage() {
  const isSuperAdmin = hasRequiredAuthority(['SUPER_ADMIN'])

  const { data: testimonials = [], isLoading } = useAdminTestimonials()
  const createTestimonial = useCreateTestimonial()
  const updateTestimonial = useUpdateTestimonial()
  const deleteTestimonial = useDeleteTestimonial()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTestimonial, setEditingTestimonial] = useState<AdminTestimonial | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const form = useForm<TestimonialFormData>({
    resolver: zodResolver(testimonialFormSchema),
    defaultValues: { quote: '', authorName: '', authorTitle: '', sortOrder: 0, published: false },
  })

  const openCreateForm = useCallback(() => {
    setEditingTestimonial(null)
    form.reset({ quote: '', authorName: '', authorTitle: '', sortOrder: 0, published: false })
    setIsFormOpen(true)
  }, [form])

  const openEditForm = useCallback(
    (testimonial: AdminTestimonial) => {
      setEditingTestimonial(testimonial)
      form.reset({
        quote: testimonial.quote,
        authorName: testimonial.authorName,
        authorTitle: testimonial.authorTitle ?? '',
        sortOrder: testimonial.sortOrder,
        published: testimonial.published,
      })
      setIsFormOpen(true)
    },
    [form],
  )

  const closeForm = useCallback(() => {
    setIsFormOpen(false)
    setEditingTestimonial(null)
  }, [])

  const onSubmit = useCallback(
    (data: TestimonialFormData) => {
      const payload = {
        quote: data.quote,
        authorName: data.authorName,
        authorTitle: data.authorTitle || undefined,
        sortOrder: data.sortOrder,
        published: data.published,
      }

      if (editingTestimonial) {
        updateTestimonial.mutate(
          { id: editingTestimonial.id, payload },
          { onSuccess: () => closeForm() },
        )
      } else {
        createTestimonial.mutate(payload, { onSuccess: () => closeForm() })
      }
    },
    [editingTestimonial, updateTestimonial, createTestimonial, closeForm],
  )

  const handleDeleteConfirm = useCallback(() => {
    if (!deletingId) return
    deleteTestimonial.mutate(deletingId, {
      onSuccess: () => setDeletingId(null),
    })
  }, [deletingId, deleteTestimonial])

  const columns: ColumnDef<AdminTestimonial, unknown>[] = useMemo(() => {
    const cols: ColumnDef<AdminTestimonial, unknown>[] = [
      {
        id: 'quote',
        header: 'Quote',
        cell: ({ row }) => (
          <span className="text-(--c-text)" title={row.original.quote}>
            {truncateQuote(row.original.quote)}
          </span>
        ),
        enableSorting: false,
      },
      {
        id: 'author',
        header: 'Author',
        cell: ({ row }) => (
          <span className="text-(--c-text)">{row.original.authorName}</span>
        ),
        enableSorting: false,
      },
      {
        id: 'published',
        header: 'Published',
        cell: ({ row }) => (
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
        cell: ({ row }) => (
          <span className="text-(--c-text)">{row.original.sortOrder}</span>
        ),
        enableSorting: false,
      },
    ]

    if (isSuperAdmin) {
      cols.push({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => openEditForm(row.original)}
              className="inline-flex items-center justify-center p-1.5 rounded-lg hover:bg-(--c-surface-hover) text-(--c-text-muted) hover:text-(--c-text) transition-colors"
              aria-label={`Edit testimonial by ${row.original.authorName}`}
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setDeletingId(row.original.id)}
              className="inline-flex items-center justify-center p-1.5 rounded-lg hover:bg-(--c-surface-hover) text-(--c-text-muted) hover:text-red-500 transition-colors"
              aria-label={`Delete testimonial by ${row.original.authorName}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ),
        enableSorting: false,
      })
    }

    return cols
  }, [isSuperAdmin, openEditForm])

  const headerAction = isSuperAdmin ? (
    <Button variant="solid" onClick={openCreateForm} leftIcon={<Plus className="h-4 w-4" />}>
      Add Testimonial
    </Button>
  ) : undefined

  return (
    <PageLayout
      title="Testimonials"
      subtitle="Manage customer testimonials displayed on your storefront"
      action={headerAction}
    >
      <DataTable
        columns={columns}
        data={testimonials}
        isLoading={isLoading}
        emptyMessage="No testimonials yet. Add your first testimonial to display on the storefront."
      />

      <Dialog open={isFormOpen} onClose={closeForm} size="md">
        <DialogHeader
          title={editingTestimonial ? 'Edit Testimonial' : 'Add Testimonial'}
          description={
            editingTestimonial
              ? 'Update the testimonial details below.'
              : 'Fill in the details to create a new testimonial.'
          }
        />
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <DialogContent>
            <div className="space-y-4">
              <div>
                <label htmlFor="quote" className="block text-sm font-medium text-(--c-text) mb-1">
                  Quote <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="quote"
                  rows={4}
                  className="w-full rounded-md border border-(--c-border) bg-(--c-panel) px-3 py-2 text-sm text-(--c-text) placeholder:text-(--c-text-muted) focus:outline-none focus:ring-2 focus:ring-(--c-ring) resize-y"
                  placeholder="Enter the customer testimonial..."
                  {...form.register('quote')}
                />
                {form.formState.errors.quote && (
                  <p className="mt-1 text-xs text-red-500">{form.formState.errors.quote.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="authorName" className="block text-sm font-medium text-(--c-text) mb-1">
                  Author Name <span className="text-red-500">*</span>
                </label>
                <Input
                  id="authorName"
                  placeholder="e.g. Jane Smith"
                  {...form.register('authorName')}
                />
                {form.formState.errors.authorName && (
                  <p className="mt-1 text-xs text-red-500">{form.formState.errors.authorName.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="authorTitle" className="block text-sm font-medium text-(--c-text) mb-1">
                  Author Title
                </label>
                <Input
                  id="authorTitle"
                  placeholder="e.g. CEO, Acme Corp (optional)"
                  {...form.register('authorTitle')}
                />
              </div>

              <div>
                <label htmlFor="sortOrder" className="block text-sm font-medium text-(--c-text) mb-1">
                  Sort Order
                </label>
                <Input
                  id="sortOrder"
                  type="number"
                  min={0}
                  {...form.register('sortOrder', { valueAsNumber: true })}
                />
                {form.formState.errors.sortOrder && (
                  <p className="mt-1 text-xs text-red-500">{form.formState.errors.sortOrder.message}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="published"
                  type="checkbox"
                  className="h-4 w-4 rounded border-(--c-border) text-(--c-accent) focus:ring-(--c-ring)"
                  {...form.register('published')}
                />
                <label htmlFor="published" className="text-sm font-medium text-(--c-text)">
                  Published
                </label>
              </div>
            </div>
          </DialogContent>
          <DialogFooter>
            <Button variant="ghost" type="button" onClick={closeForm}>
              Cancel
            </Button>
            <Button
              variant="solid"
              type="submit"
              isLoading={createTestimonial.isPending || updateTestimonial.isPending}
            >
              {editingTestimonial ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* Delete Confirmation */}
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
    </PageLayout>
  )
}
