import { useQuery } from '@tanstack/react-query'
import { storefrontHttpClient } from '@/shared/api/http/storefrontHttpClient'
import type { StorefrontMeResponse } from '../types'

export function useCustomerProfile() {
  return useQuery({
    queryKey: ['customer', 'profile'],
    queryFn: () =>
      storefrontHttpClient
        .get<StorefrontMeResponse>('/storefront/customer-portal')
        .then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  })
}
