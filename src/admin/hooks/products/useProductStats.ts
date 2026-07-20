import { useQuery } from '@tanstack/react-query'
import { gql } from 'graphql-request'

import { adminGraphqlClient } from '@/shared/api/graphql/adminGraphqlClient'
import type { ProductStats } from './types'

interface AdminProductStatsResponse {
  adminProductStats: ProductStats
}

const ADMIN_PRODUCT_STATS = gql`
  query AdminProductStats {
    adminProductStats {
      total
      active
      pending
      disabled
    }
  }
`

export function useProductStats() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-product-stats'],
    queryFn: () =>
      adminGraphqlClient.request<AdminProductStatsResponse>(ADMIN_PRODUCT_STATS),
    staleTime: 30_000,
  })

  return {
    data: data?.adminProductStats,
    isLoading,
    isError,
  }
}
