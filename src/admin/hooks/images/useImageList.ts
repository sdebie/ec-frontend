import { useInfiniteQuery } from '@tanstack/react-query'
import { adminHttpClient } from '@/shared/api/http/adminHttpClient'
import type { ImageListParams, PaginatedImages } from './types'

export function useImageList({ pageSize, search }: Omit<ImageListParams, 'page'>) {
  return useInfiniteQuery<PaginatedImages>({
    queryKey: ['admin-images', { pageSize, search }],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const { data } = await adminHttpClient.get<PaginatedImages>(
        '/admin/images/image-list/paginated',
        { params: { page: pageParam, pageSize, search } }
      )
      return data
    },
    getNextPageParam: (lastPage) => {
      const nextPage = lastPage.page + 1
      return nextPage * lastPage.pageSize < lastPage.totalCount ? nextPage : undefined
    },
  })
}
