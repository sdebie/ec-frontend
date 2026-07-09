import { useMutation } from '@tanstack/react-query'
import { storefrontHttpClient } from '@/shared/api/http/storefrontHttpClient'
import type { OrderContactPayload } from '../types'

export function useSubmitContact(orderId: string) {
  return useMutation({
    mutationFn: async (payload: OrderContactPayload) => {
      const { data } = await storefrontHttpClient.patch(
        `/orders/${orderId}/contact`,
        payload
      )
      return data
    },
  })
}
