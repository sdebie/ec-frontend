import {useMutation, useQueryClient} from '@tanstack/react-query'
import {adminHttpClient} from '@/shared/api/http/adminHttpClient'
import {toast} from '@/shared/ui/components/toast'
import type {AdminTestimonial, CreateTestimonialPayload} from '../types'

export function useCreateTestimonial() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (payload: CreateTestimonialPayload) =>
            adminHttpClient
                .post<AdminTestimonial>('/admin/testimonials', payload)
                .then((r) => r.data),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['admin', 'testimonials']})
            toast.success('Testimonial created')
        },
        onError: () => {
            toast.error('Failed to create testimonial', {duration: 0})
        },
    })
}
