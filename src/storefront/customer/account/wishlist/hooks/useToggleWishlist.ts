import {useMutation, useQueryClient} from '@tanstack/react-query'
import {storefrontHttpClient} from '@/shared/api/http/storefrontHttpClient'
import {toast} from '@/shared/ui/components/toast'

export function useToggleWishlist() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({variantId, add}: { variantId: string; add: boolean }) =>
            add ? storefrontHttpClient.post(`/storefront/wishlist/${variantId}`)
                : storefrontHttpClient.delete(`/storefront/wishlist/${variantId}`),
        onMutate: async ({variantId, add}) => {
            await queryClient.cancelQueries({queryKey: ['customer', 'wishlist']})
            const prev = queryClient.getQueryData<Set<string>>(['customer', 'wishlist'])
            queryClient.setQueryData<Set<string>>(['customer', 'wishlist'], (old) => {
                const next = new Set(old)
                if (add) {
                    next.add(variantId)
                } else {
                    next.delete(variantId)
                }
                return next
            })
            return {prev}
        },
        onError: (error, _vars, ctx) => {
            if (ctx?.prev) {
                queryClient.setQueryData(['customer', 'wishlist'], ctx.prev)
            }
            console.error('[Wishlist] toggle failed:', error)
            toast.error('Could not update your wishlist. Please try again.')
        },
        onSettled: () => {
            queryClient.invalidateQueries({queryKey: ['customer', 'wishlist']})
        },
    })
}
