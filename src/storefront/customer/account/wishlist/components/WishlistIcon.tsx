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
            {/* The heart is the one nav icon that FILLS on hover — a heart reads
                as "saved" when solid, which the cart and account glyphs have no
                equivalent of.

                It fills with the nav's hover foreground, the same colour the
                glyph itself turns, so the icon reads as one shape lighting up
                rather than an outline and a fill in two colours. Name the token,
                never `fill-current` — lucide sets a `fill="none"` presentation
                attribute and `fill-current` emits no CSS in this build, so the
                class would apply and the heart stay hollow. `fill-none` is
                stated so the hover has something to override rather than
                relying on that attribute. */}
            <Heart
                className="h-5 w-5 fill-none transition-colors group-hover:fill-(--sf-nav-icon-text-hover)"
                aria-hidden="true"
            />
            {count > 0 && <span className={NAV_ICON_BADGE}>{count}</span>}
        </Link>
    )
}
