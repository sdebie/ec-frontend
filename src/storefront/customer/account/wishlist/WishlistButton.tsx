import { Heart } from 'lucide-react'

import { useEffectiveWishlist } from './useEffectiveWishlist'
import { useToggleEffective } from './useToggleEffective'

export function WishlistButton({
  variantId,
  className,
}: {
  variantId: string
  className?: string
}) {
  const { variantIds } = useEffectiveWishlist()
  const { toggle } = useToggleEffective()

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
      className={className}
    >
      <Heart
        fill={isInWishlist ? 'currentColor' : 'none'}
        className={`h-5 w-5 ${isInWishlist ? 'text-(--sf-accent)' : ''}`}
      />
    </button>
  )
}
