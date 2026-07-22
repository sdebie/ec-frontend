import { useQuery } from '@tanstack/react-query'
import { gql } from 'graphql-request'

import { adminGraphqlClient } from '@/shared/api/graphql/adminGraphqlClient'
import type { ShippingMethod } from './types'

const SHIPPING_METHODS = gql`
  query ShippingMethods {
    shippingMethods {
      id
      name
      active
      baseFee
      estimatedDays
    }
  }
`

interface ShippingMethodsResponse {
  shippingMethods: ShippingMethod[]
}

export function useShippingMethods() {
  return useQuery({
    queryKey: ['admin-shipping-methods'],
    queryFn: () => adminGraphqlClient.request<ShippingMethodsResponse>(SHIPPING_METHODS),
    select: (data) => data.shippingMethods,
  })
}
