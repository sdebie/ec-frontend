import {useCustomerAuthStore} from '@/shared/auth/customerAuthStore'
import {useToggleWishlist} from './useToggleWishlist'
import {useLocalWishlistStore} from '../store/localWishlistStore'

export function useToggleEffective() {
    const isSignedIn = useCustomerAuthStore((s) => s.isSignedIn)
    const serverToggle = useToggleWishlist()
    const localAdd = useLocalWishlistStore((s) => s.add)
    const localRemove = useLocalWishlistStore((s) => s.remove)

    return {
        toggle: (variantId: string, add: boolean) => {
            if (isSignedIn) {
                serverToggle.mutate({variantId, add})
            } else {
                if (add) localAdd(variantId)
                else localRemove(variantId)
            }
        },
        isPending: isSignedIn ? serverToggle.isPending : false,
    }
}
