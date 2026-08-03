import {Link} from 'react-router-dom'
import {Heart} from 'lucide-react'
import {useEffectiveWishlist} from '../hooks/useEffectiveWishlist'
import {NAV_ICON_HOVER, SF_FOCUS_RING} from '@/storefront/sections/shared/focusRing'

interface WishlistIconProps {
    className?: string
}

export function WishlistIcon({className}: WishlistIconProps) {
    const {count} = useEffectiveWishlist()

    return (
        <Link
            to="/account/wishlist"
            // Hover fills the pill with the LIGHTENED accent — NAV_ICON_HOVER's
            // treatment, the same wash the other nav icons use — and keeps the
            // raw accent as the ring around it, so the control reads as one
            // deliberate shape rather than a floating outline.
            //
            // The accent is lightened toward white rather than dimmed: this nav
            // sits on a near-black bar, where lowering the accent's alpha only
            // sinks it further into the background. `--sf-accent-text` on the
            // lightened fill measures ~7.4:1.
            //
            // `p-2.5` rather than the cart's `p-2`: the count badge overhangs the
            // top-right corner, and the extra padding is what lets the ring
            // enclose the badge instead of slicing through it. The border is
            // always present but transparent, so nothing shifts on hover.
            className={`group relative flex items-center justify-center rounded-full border border-transparent p-2.5 ${NAV_ICON_HOVER} hover:border-(--sf-accent) ${SF_FOCUS_RING.nav} ${className ?? ''}`}
            aria-label={count > 0 ? `Wishlist with ${count} items` : 'Wishlist'}
        >
            {/* Fills with accent-TEXT, not accent: on the lightened accent fill a
                raw-accent heart measures ~1.5:1 and would disappear into it.
                And `fill-(--sf-accent-text)`, never `fill-current` — lucide sets
                a `fill="none"` presentation attribute and `fill-current` emits no
                CSS in this build, so the class would apply and the heart stay
                hollow. `fill-none` is stated so the hover has something to
                override rather than relying on that attribute. */}
            <Heart
                className="h-5 w-5 fill-none transition-colors group-hover:fill-(--sf-accent-text)"
                aria-hidden="true"
            />
            {count > 0 && (
                // Same badge the cart uses, pulled just inside the padding box so
                // the hover ring can contain it. It INVERTS on hover: an accent
                // badge on the lightened accent fill measures 1.5:1 and would all
                // but vanish, so the two swap.
                <span
                    className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-(--sf-accent) px-1 text-[10px] font-medium text-(--sf-accent-text) transition-colors group-hover:bg-(--sf-accent-text) group-hover:text-(--sf-accent)">
                    {count}
                </span>
            )}
        </Link>
    )
}
