import {useMutation, useQueryClient} from '@tanstack/react-query'
import {adminHttpClient} from '@/shared/api/http/adminHttpClient'
import {toast} from '@/shared/ui/components/toast'

export function useDeleteTestimonial() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) =>
            adminHttpClient.delete(`/admin/testimonials/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['admin', 'testimonials']})
            toast.success('Testimonial deleted')
        },
        onError: () => {
            toast.error('Failed to delete testimonial', {duration: 0})
        },
    })
}
