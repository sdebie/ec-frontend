import {useCallback, useState} from 'react'
import {PageLayout} from '@/shared/ui/components'
import {useCan} from '@/shared/auth/adminPermissions'
import {useAdminTestimonials} from './hooks/useAdminTestimonials'
import {TestimonialToolbar} from './components/TestimonialToolbar'
import {TestimonialTable} from './components/TestimonialTable'
import {TestimonialFormDialog} from './components/TestimonialFormDialog'
import type {AdminTestimonial} from './types'

export function TestimonialsPage() {
    const canEdit = useCan('testimonial:write')
    const {data: testimonials = [], isLoading} = useAdminTestimonials()

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

    return (
        <PageLayout
            title="Testimonials"
            subtitle="Manage customer testimonials displayed on your storefront"
        >
            <div className="space-y-4">
                <TestimonialToolbar canEdit={canEdit} onAddTestimonial={openCreateForm}/>

                <TestimonialTable
                    data={testimonials}
                    isLoading={isLoading}
                    canEdit={canEdit}
                    onEdit={openEditForm}
                />
            </div>

            {isFormOpen && (
                <TestimonialFormDialog
                    open={isFormOpen}
                    testimonial={editingTestimonial}
                    onClose={closeForm}
                />
            )}
        </PageLayout>
    )
}
