import {useQuery} from '@tanstack/react-query'
import {isAxiosError} from 'axios'
import {storefrontHttpClient} from '@/shared/api/http/storefrontHttpClient'

export interface PublicPageContent {
    slug: string
    title: string
    content: string
    publishedAt: string
}

export function usePublicPageContent(slug: string) {
    const query = useQuery<PublicPageContent>({
        queryKey: ['storefront', 'pages', slug],
        queryFn: () =>
            storefrontHttpClient
                .get<PublicPageContent>(`/storefront/pages/${slug}`)
                .then((r) => r.data),
        enabled: !!slug,
    })

    const isNotFound =
        !!query.error && isAxiosError(query.error) && query.error.response?.status === 404

    return {
        data: query.data,
        isLoading: query.isLoading,
        error: query.error,
        isNotFound,
        refetch: query.refetch,
    }
}
