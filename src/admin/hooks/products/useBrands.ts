import { useQuery } from '@tanstack/react-query'
import { gql } from 'graphql-request'

import { adminGraphqlClient } from '@/shared/api/graphql/adminGraphqlClient'

export interface Brand {
  id: string
  name: string
}

interface GetBrandsResponse {
  getBrands: {
    content: Brand[]
  }
}

const GET_BRANDS = gql`
  query GetBrands($pageSize: Int) {
    getBrands(pageSize: $pageSize) {
      content {
        id
        name
      }
    }
  }
`

export function useBrands() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-brands'],
    queryFn: () =>
      adminGraphqlClient.request<GetBrandsResponse>(GET_BRANDS, {
        pageSize: 500,
      }),
  })

  return {
    data: data?.getBrands.content,
    isLoading,
  }
}
