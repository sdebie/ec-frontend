import { useCustomerAuthStore } from '@/shared/auth/customerAuthStore'
import { useWishlist } from '../hooks/useWishlist'
import { useLocalWishlistStore } from './localWishlistStore'

export function useEffectiveWishlist(): {
  variantIds: Set<string>
  count: number
  isLoading: boolean
} {
  const { isSignedIn } = useCustomerAuthStore()
  const { data: serverWishlist, isLoading } = useWishlist()
  const localIds = useLocalWishlistStore((s) => s.variantIds)
  const localCount = useLocalWishlistStore((s) => s.count)

  if (isSignedIn) {
    // Union with any not-yet-merged local IDs (Req 4.4): the sign-in merge is an
    // idempotent union, so server ∪ local equals the post-merge state — the count
    // never dips or flickers while the merge is in flight.
    if (localCount === 0) {
      return {
        variantIds: serverWishlist ?? new Set(),
        count: serverWishlist?.size ?? 0,
        isLoading,
      }
    }
    const union = new Set(serverWishlist)
    for (const id of localIds) union.add(id)
    return { variantIds: union, count: union.size, isLoading }
  }
  return { variantIds: localIds, count: localCount, isLoading: false }
}
