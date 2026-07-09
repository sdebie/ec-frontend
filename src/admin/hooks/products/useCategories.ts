import { useQuery } from '@tanstack/react-query'
import { gql } from 'graphql-request'

import { adminGraphqlClient } from '@/shared/api/graphql/adminGraphqlClient'

export interface Category {
  id: string
  name: string
}

interface GetCategoriesResponse {
  getCategories: {
    content: Category[]
  }
}

const GET_CATEGORIES = gql`
  query GetCategories($pageSize: Int) {
    getCategories(pageSize: $pageSize) {
      content {
        id
        name
      }
    }
  }
`

export function useCategories() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () =>
      adminGraphqlClient.request<GetCategoriesResponse>(GET_CATEGORIES, {
        pageSize: 500,
      }),
  })

  return {
    data: data?.getCategories.content,
    isLoading,
  }
}
