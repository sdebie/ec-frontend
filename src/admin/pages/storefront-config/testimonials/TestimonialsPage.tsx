import { useCallback, useState } from 'react'
import { Plus } from 'lucide-react'

import { PageLayout } from '@/shared/ui/components'
import { Button } from '@/shared/ui/primitives'
import { useCan } from '@/shared/auth/adminPermissions'
import { useAdminTestimonials } from './hooks/useAdminTestimonials'
import { TestimonialTable } from './components/TestimonialTable'
import { TestimonialFormDialog } from './components/TestimonialFormDialog'
import type { AdminTestimonial } from './types'

export function TestimonialsPage() {
  const canEdit = useCan('testimonial:write')
  const { data: testimonials = [], isLoading } = useAdminTestimonials()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTestimonial, setEditingTestimonial] = useState<AdminTestimonial | null>(null)

  const openCreateForm = useCallback(() => {
    setEditingTestimonial(null)
    setIsFormOpen(true)
  }, [])

  const openEditForm = useCallback((testimonial: AdminTestimonial) => {
    setEditingTestimonial(testimonial)
    setIsFormOpen(true)
  }, [])

  const closeForm = useCallback(() => {
    setIsFormOpen(false)
    setEditingTestimonial(null)
  }, [])

  const headerAction = canEdit ? (
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
      <TestimonialTable
        data={testimonials}
        isLoading={isLoading}
        canEdit={canEdit}
        onEdit={openEditForm}
      />

      {isFormOpen && (
        <TestimonialFormDialog open={isFormOpen} testimonial={editingTestimonial} onClose={closeForm} />
      )}
    </PageLayout>
  )
}
