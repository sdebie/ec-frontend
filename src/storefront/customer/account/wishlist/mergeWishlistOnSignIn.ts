import {QueryClient} from '@tanstack/react-query'
import {useLocalWishlistStore} from './store/localWishlistStore'
import {storefrontHttpClient} from '@/shared/api/http/storefrontHttpClient'

/**
 * Merges the local (signed-out) wishlist into the server wishlist on sign-in.
 *
 * Called from login/registration onSuccess callbacks. This is fire-and-forget —
 * it must NEVER throw or block the sign-in flow.
 *
 * - Fires POST /api/storefront/wishlist/{id} for each local ID concurrently.
 * - Swallows 404 (variant deleted) — drops the ID silently.
 * - On full success: clears local store.
 * - On partial failure: keeps only un-merged IDs in local store for retry at next sign-in.
 * - Always invalidates ['customer', 'wishlist'] query after merge attempt.
 */
export async function mergeWishlistOnSignIn(queryClient: QueryClient): Promise<void> {
    try {
        const {variantIds, clear} = useLocalWishlistStore.getState()
        if (variantIds.size === 0) return

        const ids = Array.from(variantIds)

        // Fire all adds concurrently — each is idempotent.
        // 404 (variant deleted) → drop silently.
        // Network errors → leave un-merged IDs in local store for retry.
        const results = await Promise.allSettled(
            ids.map((id) =>
                storefrontHttpClient.post(`/storefront/wishlist/${id}`).catch((err) => {
                    if (err?.response?.status === 404) return // variant deleted, swallow
                    throw err
                })
            )
        )

        // Check if any failed for reasons other than 404
        const unmerged = ids.filter((_, i) => results[i].status === 'rejected')

        if (unmerged.length === 0) {
            clear()
        } else {
            // Keep only un-merged IDs for next sign-in retry
            clear()
            unmerged.forEach((id) => useLocalWishlistStore.getState().add(id))
        }

        // Refresh server wishlist state
        queryClient.invalidateQueries({queryKey: ['customer', 'wishlist']})
    } catch {
        // Never throw — this is fire-and-forget. Failures do not block sign-in.
    }
}
