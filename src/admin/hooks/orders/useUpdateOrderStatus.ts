import { useMutation, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { toast } from '@/shared/ui/components/toast'
import { adminHttpClient } from '@/shared/api/http/adminHttpClient'
import type { OrderStatusUpdatePayload } from './types'

interface UpdateOrderStatusParams {
  orderId: string
  payload: OrderStatusUpdatePayload
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ orderId, payload }: UpdateOrderStatusParams) => {
      await adminHttpClient.patch(`/admin/orders/${orderId}/status`, payload)
    },
    onSuccess: (_data, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders', orderId] })
      toast.success('Order status updated')
    },
    onError: (error) => {
      console.error(isAxiosError(error) ? error.response?.data : error)
      toast.error('Failed to update order status', { duration: 0 })
    },
  })
}
