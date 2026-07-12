import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { useWishlist } from '../hooks/useWishlist'

export function WishlistPage() {
  const { data: wishlist, isLoading } = useWishlist()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-(--sf-text)">Wishlist</h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-48 animate-pulse rounded-lg bg-(--sf-surface-muted)"
            />
          ))}
        </div>
      </div>
    )
  }

  const variantIds = wishlist ? Array.from(wishlist) : []

  if (variantIds.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-(--sf-text)">Wishlist</h1>
        <div className="rounded-lg border border-(--sf-border) p-8 text-center">
          <p className="text-(--sf-muted-text)">Your wishlist is empty</p>
          <Link
            to="/products"
            className="mt-3 inline-block text-sm font-medium text-(--sf-accent) hover:opacity-80"
          >
            Browse products
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-(--sf-text)">Wishlist</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {variantIds.map((variantId) => (
          <div
            key={variantId}
            className="relative rounded-lg border border-(--sf-border) p-4"
          >
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-(--sf-text)">
                  Variant
                </p>
                <p className="mt-1 truncate text-xs text-(--sf-muted-text)">
                  {variantId}
                </p>
              </div>
              <button
                aria-label="Remove from wishlist"
                aria-pressed={true}
                className="ml-2 shrink-0 text-red-500"
              >
                <Heart className="h-5 w-5 fill-current" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
