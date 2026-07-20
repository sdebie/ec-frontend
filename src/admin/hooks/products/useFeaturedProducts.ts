import { useQuery } from '@tanstack/react-query'
import { gql } from 'graphql-request'

import { adminGraphqlClient } from '@/shared/api/graphql/adminGraphqlClient'
import type { AdminProductListItem } from './types'

export interface FeaturedProductListResponse {
  featuredProductList: AdminProductListItem[]
}

export const FEATURED_PRODUCT_LIST = gql`
  query FeaturedProductList {
    featuredProductList {
      id
      name
      slug
      sku
      status
      thumbnailUrl
      retailPrice
      category {
        id
        name
      }
    }
  }
`

export function useFeaturedProducts() {
  return useQuery({
    queryKey: ['admin-featured-products'],
    queryFn: () =>
      adminGraphqlClient.request<FeaturedProductListResponse>(FEATURED_PRODUCT_LIST),
  })
}
