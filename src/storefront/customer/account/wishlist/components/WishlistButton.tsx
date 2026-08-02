import {Heart} from 'lucide-react'

import {useEffectiveWishlist} from '../hooks/useEffectiveWishlist'
import {useToggleEffective} from '../hooks/useToggleEffective'

export function WishlistButton({
                                   variantId,
                                   className,
                               }: {
    variantId: string
    className?: string
}) {
    const {variantIds} = useEffectiveWishlist()
    const {toggle} = useToggleEffective()

    const isInWishlist = variantIds.has(variantId)

    function handleClick(e: React.MouseEvent) {
        e.preventDefault()
        e.stopPropagation()
        toggle(variantId, !isInWishlist)
    }

    return (
        <button
            onClick={handleClick}
            aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            aria-pressed={isInWishlist}
            // Named group: the card root already carries `group` (image zoom, quick-view
            // reveal), so a bare group-hover here would fill the heart from anywhere on
            // the card. group/wishlist scopes the hover fill to this button alone.
            className={`group/wishlist ${className ?? ''}`}
        >
            <Heart
                className={`h-5 w-5 text-(--sf-accent) transition-colors ${
                    isInWishlist ? 'fill-current' : 'fill-transparent group-hover/wishlist:fill-current'
                }`}
            />
        </button>
    )
}
