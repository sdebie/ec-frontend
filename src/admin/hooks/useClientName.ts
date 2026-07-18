import { useQuery } from '@tanstack/react-query'
import { storefrontHttpClient } from '@/shared/api/http/storefrontHttpClient'
import type { StorefrontConfig } from '@/shared/types/StorefrontConfig'

/**
 * The admin shell lives outside StorefrontConfigProvider, but client identity
 * is DB seed data (architectural law #1 — no client-specific build config).
 * This reads clientName from the same public `/storefront/config` endpoint,
 * reusing the `['storefront-config']` query cache so it dedupes with the
 * storefront provider when both are mounted.
 */
export function useClientName(): string {
  const { data } = useQuery({
    queryKey: ['storefront-config'],
    queryFn: async () => {
      const { data } = await storefrontHttpClient.get<StorefrontConfig>('/storefront/config')
      return data
    },
    staleTime: Infinity,
  })

  return data?.clientName ?? 'Admin Portal'
}
