import { useQuery } from '@tanstack/react-query'
import { gql } from 'graphql-request'
import { graphqlClient } from '@/shared/api/graphql/graphqlClient'

interface Category {
  id: string
  name: string
  slug: string
  parent?: { id: string; name: string; slug: string } | null
}

interface StorefrontCategoriesResponse {
  getCategories: {
    content: Category[]
    totalElements: number
  }
}

const GET_CATEGORIES = gql`
  query StorefrontCategories($pageIndex: Int, $pageSize: Int) {
    getCategories(pageIndex: $pageIndex, pageSize: $pageSize) {
      content {
        id
        name
        slug
        parent { id name slug }
      }
      totalElements
    }
  }
`

export function useCategories() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['categories'],
    queryFn: () =>
      graphqlClient.request<StorefrontCategoriesResponse>(GET_CATEGORIES, {
        pageIndex: 0,
        pageSize: 500,
      }),
    staleTime: 10 * 60 * 1000, // 10 minutes — categories are reference data
  })

  return {
    categories: data?.getCategories.content ?? [],
    isLoading,
    isError,
  }
}
