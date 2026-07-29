import {useQuery} from '@tanstack/react-query'
import {storefrontHttpClient} from '@/shared/api/http/storefrontHttpClient'

export interface Testimonial {
    id: string
    quote: string
    authorName: string
    authorTitle: string | null
}

export function useTestimonials() {
    return useQuery<Testimonial[]>({
        queryKey: ['storefront', 'testimonials'],
        queryFn: () =>
            storefrontHttpClient
                .get<Testimonial[]>('/storefront/testimonials')
                .then((r) => r.data),
    })
}
