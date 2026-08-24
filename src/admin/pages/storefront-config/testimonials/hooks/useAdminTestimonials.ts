import {useQuery} from '@tanstack/react-query'
import {adminHttpClient} from '@/shared/api/http/adminHttpClient'
import type {AdminTestimonial} from '../types'

export function useAdminTestimonials() {
    return useQuery<AdminTestimonial[]>({
        queryKey: ['admin', 'testimonials'],
        queryFn: () =>
            adminHttpClient
                .get<AdminTestimonial[]>('/admin/testimonials')
                .then((r) => r.data),
    })
}
