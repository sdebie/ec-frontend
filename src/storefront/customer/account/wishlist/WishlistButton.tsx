import { Heart } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useCustomerAuthStore } from '@/shared/auth/customerAuthStore'

import { useToggleWishlist } from '../hooks/useToggleWishlist'
import { useWishlist } from '../hooks/useWishlist'

export function WishlistButton({ variantId }: { variantId: string }) {
  const { isSignedIn } = useCustomerAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const { data: wishlisted } = useWishlist()
  const toggle = useToggleWishlist()

  const isInWishlist = wishlisted?.has(variantId) ?? false

  function handleClick() {
    if (!isSignedIn) {
      navigate(`/account/login?return=${encodeURIComponent(location.pathname)}`)
      return
    }
    toggle.mutate({ variantId, add: !isInWishlist })
  }

  return (
    <button
      onClick={handleClick}
      aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      aria-pressed={isInWishlist}
    >
      <Heart
        fill={isInWishlist ? 'currentColor' : 'none'}
        className="h-5 w-5"
      />
    </button>
  )
}
