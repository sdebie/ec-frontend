import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { useEffectiveWishlist } from './useEffectiveWishlist'

interface WishlistIconProps {
  className?: string
}

export function WishlistIcon({ className }: WishlistIconProps) {
  const { count } = useEffectiveWishlist()

  return (
    <Link
      to="/account/wishlist"
      className={`relative flex items-center justify-center rounded-md p-2 text-(--sf-nav-icon-text) hover:text-(--sf-nav-icon-text-hover) hover:bg-(--sf-nav-border) ${className ?? ''}`}
      aria-label={count > 0 ? `Wishlist with ${count} items` : 'Wishlist'}
    >
      <Heart className="h-5 w-5" aria-hidden="true" />
      {count > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-(--sf-accent) px-1 text-xs font-medium text-(--sf-accent-text)">
          {count}
        </span>
      )}
    </Link>
  )
}
