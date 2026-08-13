import { useQuery } from '@tanstack/react-query'
import { gql } from 'graphql-request'

import { adminGraphqlClient } from '@/shared/api/graphql/adminGraphqlClient'
import type { CategoryDetail } from '../types'

interface CategoryResponse {
  category: CategoryDetail | null
}

const GET_CATEGORY = gql`
  query GetCategory($id: String!) {
    category(id: $id) {
      id
      name
      slug
      description
      imageUrl
      parent {
        id
        name
      }
    }
  }
`

export function useCategoryDetail(categoryId: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-category', categoryId],
    queryFn: () =>
      adminGraphqlClient.request<CategoryResponse>(GET_CATEGORY, { id: categoryId }),
    enabled: !!categoryId,
  })

  return {
    data: data?.category ?? undefined,
    isLoading,
    error,
  }
}
