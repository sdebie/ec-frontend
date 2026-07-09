import { useQuery } from '@tanstack/react-query'
import { gql } from 'graphql-request'
import { graphqlClient } from '@/shared/api/graphql/graphqlClient'

export interface OrderAddress {
  line1: string
  line2: string | null
  suburb: string | null
  city: string
  province: string
  postalCode: string
}

export interface OrderLineItem {
  productName: string
  variantName: string
  quantity: number
  unitPrice: number
}

export interface OrderStatusEvent {
  status: string
  timestamp: string
}

export interface OrderDetail {
  id: string
  orderDate: string
  status: 'CREATED' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  totalAmount: number
  shippingAddress: OrderAddress
  lineItems: OrderLineItem[]
  statusHistory: OrderStatusEvent[]
}

interface OrderDetailResponse {
  getOrderDetail: OrderDetail
}

const ORDER_DETAIL_QUERY = gql`
  query getOrderDetail($id: String!) {
    getOrderDetail(id: $id) {
      id
      orderDate
      status
      totalAmount
      shippingAddress {
        line1
        line2
        suburb
        city
        province
        postalCode
      }
      lineItems {
        productName
        variantName
        quantity
        unitPrice
      }
      statusHistory {
        status
        timestamp
      }
    }
  }
`

export function useOrderDetail(orderId: string) {
  return useQuery({
    queryKey: ['customer', 'orders', orderId],
    queryFn: () => graphqlClient.request<OrderDetailResponse>(ORDER_DETAIL_QUERY, { id: orderId }),
    enabled: !!orderId,
  })
}
