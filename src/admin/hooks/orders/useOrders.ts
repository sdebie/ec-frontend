import { useQuery } from '@tanstack/react-query'

import { adminHttpClient } from '@/shared/api/http/adminHttpClient'

import type { OrdersPage } from './types'

export interface UseOrdersParams {
  page: number
  pageSize: number
  status?: string
  fromDate?: string
  toDate?: string
}

export function useOrders(params: UseOrdersParams) {
  return useQuery({
    queryKey: ['admin', 'orders', params],
    queryFn: async () => {
      const response = await adminHttpClient.get<OrdersPage>(
        '/admin/orders',
        { params },
      )

      return response.data
    },
  })
}
