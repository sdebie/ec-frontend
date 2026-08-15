import { useQuery } from '@tanstack/react-query'
import { gql } from 'graphql-request'

import { adminGraphqlClient } from '@/shared/api/graphql/adminGraphqlClient'

import type { AdminOrderDetail } from '../types'

interface AdminOrderResponse {
  adminOrder: AdminOrderDetail
}

const ADMIN_ORDER = gql`
  query AdminOrder($id: String!) {
    adminOrder(id: $id) {
      id
      reference
      customerName
      customerEmail
      placedAt
      itemCount
      total
      status
      shippingAddress {
        street
        city
        province
        postalCode
      }
      trackingNumber
      trackingCarrier
      lineItems {
        id
        productName
        variantSku
        thumbnailUrl
        unitPrice
        quantity
        lineTotal
      }
      subtotal
      shippingCost
      vatAmount
      grandTotal
      statusHistory {
        status
        timestamp
        staffName
      }
    }
  }
`

export function useOrderDetail(orderId: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'orders', 'detail', orderId],
    queryFn: async () => {
      const response = await adminGraphqlClient.request<AdminOrderResponse>(ADMIN_ORDER, {
        id: orderId,
      })

      return response.adminOrder
    },
    enabled: !!orderId,
  })

  return { data, isLoading, error }
}
