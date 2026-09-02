import {useInfiniteQuery} from '@tanstack/react-query'
import {adminHttpClient} from '@/shared/api/http/adminHttpClient'
import type {ImageListParams, PaginatedImages} from '@/admin/hooks/images/types'

export function useImageList({pageSize, search, directory, enabled = true}: Omit<ImageListParams, 'page'> & {
    enabled?: boolean
}) {
    return useInfiniteQuery<PaginatedImages>({
        queryKey: ['admin-images', {pageSize, search, directory}],
        initialPageParam: 0,
        queryFn: async ({pageParam}) => {
            const {data} = await adminHttpClient.get<PaginatedImages>(
                '/admin/images/image-list/paginated',
                {params: {page: pageParam, pageSize, search, directory}}
            )
            return data
        },
        getNextPageParam: (lastPage) => {
            const nextPage = lastPage.page + 1
            return nextPage * lastPage.pageSize < lastPage.totalCount ? nextPage : undefined
        },
        enabled,
    })
}
