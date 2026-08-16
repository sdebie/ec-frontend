import { useMutation, useQueryClient } from '@tanstack/react-query'

import { adminHttpClient } from '@/shared/api/http/adminHttpClient'
import { toast } from '@/shared/ui/components/toast'
import type { AdminTestimonial, UpdateTestimonialPayload } from './types'

export function useUpdateTestimonial() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTestimonialPayload }) =>
      adminHttpClient
        .put<AdminTestimonial>(`/admin/testimonials/${id}`, payload)
        .then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'testimonials'] })
      toast.success('Testimonial updated')
    },
    onError: () => {
      toast.error('Failed to update testimonial', { duration: 0 })
    },
  })
}
