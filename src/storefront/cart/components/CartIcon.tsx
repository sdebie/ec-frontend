import {Link} from 'react-router-dom'
import {ShoppingCart} from 'lucide-react'
import {useCartStore} from '../store/cartStore'

interface CartIconProps {
    className?: string
}

export function CartIcon({className}: CartIconProps) {
    const itemCount = useCartStore((s) => s.itemCount)

    return (
        <Link
            to="/cart"
            className={`relative flex items-center justify-center rounded-md p-2 text-(--sf-nav-icon-text) hover:text-(--sf-nav-icon-text-hover) hover:bg-(--sf-nav-border) ${className ?? ''}`}
            aria-label={itemCount > 0 ? `Cart with ${itemCount} items` : 'Cart'}
        >
            <ShoppingCart className="h-5 w-5" aria-hidden="true"/>
            {itemCount > 0 && (
                <span
                    className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-(--sf-accent) px-1 text-xs font-medium text-(--sf-accent-text)">
                  {itemCount}
                </span>
            )}
        </Link>
    )
}
