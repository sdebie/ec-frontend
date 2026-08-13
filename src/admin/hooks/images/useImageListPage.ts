import {useQuery} from '@tanstack/react-query'
import {adminHttpClient} from '@/shared/api/http/adminHttpClient'
import type {ImageListParams, PaginatedImages} from './types'

// Page-replace variant of useImageList (which accumulates pages for a "load more" feed).
// The same endpoint, the same params — callers that want a paged grid
// with Prev/Next instead of an infinite list use this one.
export function useImageListPage({page, pageSize, search, directory, enabled = true}: ImageListParams & {
    enabled?: boolean
}) {
    return useQuery<PaginatedImages>({
        queryKey: ['admin-images-page', {page, pageSize, search, directory}],
        queryFn: async () => {
            const {data} = await adminHttpClient.get<PaginatedImages>(
                '/admin/images/image-list/paginated',
                {params: {page, pageSize, search, directory}}
            )
            return data
        },
        enabled,
    })
}
