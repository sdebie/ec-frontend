import {useQuery} from '@tanstack/react-query'
import {adminHttpClient} from '@/shared/api/http/adminHttpClient'

export interface PageContentSummary {
    id: string
    slug: string
    title: string
    category: string
    publishedAt: string | null
    updatedAt: string
    hasUnpublishedChanges: boolean
}

export function useLegalPages() {
    const {data, isLoading, error} = useQuery({
        queryKey: ['admin', 'pages', 'legal'],
        queryFn: async () => {
            const response = await adminHttpClient.get<PageContentSummary[]>(
                '/admin/pages',
                {params: {category: 'LEGAL'}},
            )
            return response.data
        },
    })

    return {data, isLoading, error}
}
