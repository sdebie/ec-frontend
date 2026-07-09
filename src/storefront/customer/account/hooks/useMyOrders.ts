import { useQuery } from '@tanstack/react-query'
import { gql } from 'graphql-request'
import { graphqlClient } from '@/shared/api/graphql/graphqlClient'

export interface MyOrder {
  id: string
  orderDate: string
  status: 'CREATED' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  itemCount: number
  totalAmount: number
}

interface MyOrdersResponse {
  myOrders: MyOrder[]
}

const MY_ORDERS_QUERY = gql`
  query myOrders {
    myOrders {
      id
      orderDate
      status
      itemCount
      totalAmount
    }
  }
`

export function useMyOrders() {
  return useQuery({
    queryKey: ['customer', 'orders'],
    queryFn: () => graphqlClient.request<MyOrdersResponse>(MY_ORDERS_QUERY),
  })
}
