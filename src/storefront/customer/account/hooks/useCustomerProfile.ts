import { useQuery } from '@tanstack/react-query'
import { storefrontHttpClient } from '@/shared/api/http/storefrontHttpClient'
import type { StorefrontMeResponse } from '../types'

/**
 * The single definition of "who is the signed-in customer".
 * `useRestoreCustomerSession` fetches the same resource during startup and
 * seeds this cache entry with what it got, so an account page mounting after
 * a restore does not re-request what was just retrieved.
 */
export const CUSTOMER_PROFILE_ENDPOINT = '/storefront/customer-portal'
export const CUSTOMER_PROFILE_QUERY_KEY = ['customer', 'profile'] as const

export function useCustomerProfile() {
  return useQuery({
    queryKey: CUSTOMER_PROFILE_QUERY_KEY,
    queryFn: () =>
      storefrontHttpClient
        .get<StorefrontMeResponse>(CUSTOMER_PROFILE_ENDPOINT)
        .then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  })
}
