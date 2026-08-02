import { useQuery } from '@tanstack/react-query'
import { storefrontHttpClient } from '@/shared/api/http/storefrontHttpClient.ts'
import { useCustomerAuthStore } from '@/shared/auth/customerAuthStore.ts'
import type { WishlistResponse } from '../../types.ts'

export function useWishlist() {
  const { isSignedIn } = useCustomerAuthStore()

  return useQuery({
    queryKey: ['customer', 'wishlist'],
    queryFn: () =>
      storefrontHttpClient
        .get<WishlistResponse>('/storefront/wishlist')
        .then((r) => new Set(r.data.variantIds)),
    enabled: isSignedIn,
    staleTime: 2 * 60 * 1000,
  })
}
