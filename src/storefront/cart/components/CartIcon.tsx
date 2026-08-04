import {Link} from 'react-router-dom'
import {ShoppingCart} from 'lucide-react'
import {useCartStore} from '../store/cartStore'
import {NAV_ICON_BADGE, NAV_ICON_PILL, SF_FOCUS_RING} from '@/storefront/sections/shared/focusRing'

interface CartIconProps {
    className?: string
}

export function CartIcon({className}: CartIconProps) {
    const itemCount = useCartStore((s) => s.itemCount)

    return (
        <Link
            to="/cart"
            className={`${NAV_ICON_PILL} ${SF_FOCUS_RING.nav} ${className ?? ''}`}
            aria-label={itemCount > 0 ? `Cart with ${itemCount} items` : 'Cart'}
        >
            {/* No hover fill: a solid shopping-cart glyph reads as a heavy blob
                rather than as a state. The heart fills because "solid = saved"
                is a meaning a heart carries; a cart has no equivalent. */}
            <ShoppingCart className="h-5 w-5" aria-hidden="true"/>
            {itemCount > 0 && <span className={NAV_ICON_BADGE}>{itemCount}</span>}
        </Link>
    )
}
