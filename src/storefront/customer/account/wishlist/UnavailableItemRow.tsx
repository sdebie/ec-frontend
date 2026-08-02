import { Heart } from 'lucide-react'
import { resolveImageUrl } from '@/shared/utils/imageUrl'
import { parseVariantLabel } from '@/storefront/catalog/utils/variantLabel'
import type { HydratedWishlistItem } from './useWishlistHydration'

interface UnavailableItemRowProps {
  item: HydratedWishlistItem
  onRemove: (variantId: string) => void
}

/**
 * A compact full-width notice row for wishlist items whose product is no longer
 * active (productActive === false). These items have no PDP (ProductService
 * returns null for non-ACTIVE products), so no links are rendered — only a
 * muted presentation and an explicit "Remove" action.
 *
 * This is deliberately NOT a ProductCard variant (law 4): a disabled product
 * has no purchase path, no trustworthy price, and no page to link to.
 */
export function UnavailableItemRow({ item, onRemove }: UnavailableItemRowProps) {
  const imageUrl = resolveImageUrl(item.imagePath)
  const variantLabel = parseVariantLabel(item.variantLabel)

  return (
    <div
      className="flex min-h-11 w-full items-center gap-3 rounded-lg border border-(--sf-border) bg-(--sf-panel) px-3 py-2"
    >
      {/* Muted unlinked thumbnail */}
      <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded opacity-50">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <Heart className="h-5 w-5 text-(--sf-muted-text)" />
        )}
      </div>

      {/* Product name + variant label + unavailable message */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-3">
        <div className="min-w-0 flex-shrink">
          <span className="block truncate text-sm text-(--sf-muted-text)">
            {item.productName}
          </span>
          {variantLabel && (
            <span className="block truncate text-xs text-(--sf-muted-text)">
              {variantLabel}
            </span>
          )}
        </div>
        <span className="shrink-0 text-xs italic text-(--sf-muted-text)">
          This product is no longer available
        </span>
      </div>

      {/* Bordered "Remove" button */}
      <button
        type="button"
        onClick={() => onRemove(item.variantId)}
        aria-label={`Remove ${item.productName} from wishlist`}
        className="shrink-0 cursor-pointer rounded border border-(--sf-border) px-3 py-1.5 text-xs font-medium text-(--sf-muted-text) transition-colors hover:bg-(--sf-surface-muted) hover:text-(--sf-text)"
      >
        Remove
      </button>
    </div>
  )
}
