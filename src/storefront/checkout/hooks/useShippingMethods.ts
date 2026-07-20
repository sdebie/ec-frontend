import { useQuery } from '@tanstack/react-query'
import { storefrontHttpClient } from '@/shared/api/http/storefrontHttpClient'
import type { ShippingMethod } from '../types'

export function useShippingMethods() {
  return useQuery({
    queryKey: ['checkout', 'shipping-methods'],
    queryFn: async () => {
      const { data } = await storefrontHttpClient.get<ShippingMethod[]>(
        '/storefront/shipping-methods'
      )
      return data
    },
    staleTime: 5 * 60 * 1000,
  })
}
