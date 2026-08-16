import { useQuery } from '@tanstack/react-query'
import { gql } from 'graphql-request'
import { graphqlClient } from '@/shared/api/graphql/graphqlClient'
import { OrderStatus } from '@/shared/types/enums/OrderStatus'

export interface MyOrder {
  id: string
  orderDate: string
  /**
   * The real status vocabulary, not a hand-written subset. The previous inline union
   * listed `SHIPPED` — which `OrderStatusEn` has never had — and omitted `IN_TRANSIT`,
   * `IN_STORE_PAYMENT`, `REFUNDED`, `FAILED`, `SYSTEM_CANCELED` and `PENDING`. Because
   * the type claimed those could not occur, nothing downstream had to handle them and
   * `tsc` could not see that the badge map was keyed on a status the server never sends.
   */
  status: OrderStatus
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
