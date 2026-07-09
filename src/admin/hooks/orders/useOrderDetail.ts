import { useQuery } from '@tanstack/react-query'

import { adminHttpClient } from '@/shared/api/http/adminHttpClient'

import type { AdminOrderDetail } from './types'

export function useOrderDetail(orderId: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'orders', orderId],
    queryFn: async () => {
      const response = await adminHttpClient.get<AdminOrderDetail>(
        `/admin/orders/${orderId}`,
      )

      return response.data
    },
    enabled: !!orderId,
  })

  return { data, isLoading, error }
}
