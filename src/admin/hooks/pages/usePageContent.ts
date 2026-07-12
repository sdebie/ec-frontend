import { useQuery } from '@tanstack/react-query'

import { adminHttpClient } from '@/shared/api/http/adminHttpClient'

export interface PageContent {
  id: string
  slug: string
  title: string
  category: string
  draftContent: string | null
  publishedContent: string | null
  publishedAt: string | null
  updatedAt: string
}

export function usePageContent(id: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'pages', id],
    queryFn: async () => {
      const response = await adminHttpClient.get<PageContent>(
        `/admin/pages/${id}`,
      )
      return response.data
    },
    enabled: !!id,
  })

  return { data, isLoading, error }
}
