import {Link} from 'react-router-dom'
import {Heart} from 'lucide-react'
import {useEffectiveWishlist} from '../hooks/useEffectiveWishlist'
import {NAV_ICON_BADGE, NAV_ICON_PILL, SF_FOCUS_RING} from '@/storefront/sections/shared/focusRing'

interface WishlistIconProps {
    className?: string
}

export function WishlistIcon({className}: WishlistIconProps) {
    const {count} = useEffectiveWishlist()

    return (
        <Link
            to="/account/wishlist"
            className={`${NAV_ICON_PILL} ${SF_FOCUS_RING.nav} ${className ?? ''}`}
            aria-label={count > 0 ? `Wishlist with ${count} items` : 'Wishlist'}
        >
            {/* The heart stays hollow through hover. The cart and account glyphs
                beside it have no fill state, so filling this one alone would
                break the header's single response — and a solid heart is the
                "saved" signal on a product card, so filling it here would
                announce a save that has not happened. The control answers with
                colour and the wash behind it, exactly like its neighbours.

                `fill-none` is stated rather than left to lucide's `fill="none"`
                presentation attribute, which any CSS rule would outrank. */}
            <Heart className="h-5 w-5 fill-none" aria-hidden="true"/>
            {count > 0 && <span className={NAV_ICON_BADGE}>{count}</span>}
        </Link>
    )
}
