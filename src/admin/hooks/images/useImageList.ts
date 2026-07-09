import { useQuery } from '@tanstack/react-query'
import { adminHttpClient } from '@/shared/api/http/adminHttpClient'
import type { ImageListParams, PaginatedImages } from './types'

export function useImageList(params: ImageListParams) {
  return useQuery<PaginatedImages>({
    queryKey: ['admin-images', params],
    queryFn: async () => {
      const { data } = await adminHttpClient.get<PaginatedImages>(
        '/admin/images/image-list/paginated',
        { params }
      )
      return data
    },
  })
}
