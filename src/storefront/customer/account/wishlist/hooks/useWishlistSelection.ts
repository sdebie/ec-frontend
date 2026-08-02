import { useCustomerAuthStore } from '@/shared/auth/customerAuthStore'
import { getDisplayPrice } from '@/storefront/catalog/utils/pricing'
import type { HydratedWishlistItem } from '../types'

export interface WishlistSelection {
  /** Product still active — renders as a card (purchasable or "View product"). */
  availableItems: HydratedWishlistItem[]
  /** Product gone — renders as a notice row, never a card. */
  unavailableItems: HydratedWishlistItem[]
  /** Eligible to move to the cart. */
  purchasableItems: HydratedWishlistItem[]
  /** Sum of the purchasable set's display prices, ex VAT. */
  estimatedSubtotal: number
  /** The single guard used by every cart write, whatever the caller. */
  isPurchasable: (item: HydratedWishlistItem) => boolean
}

/**
 * Derives the wishlist's availability partitions and the estimated subtotal from
 * the hydrated items and the shopper's tier.
 *
 * Pricing: the display price is SELECTED via the shared `getDisplayPrice`, never
 * calculated, and the subtotal only sums figures the backend already chose — so
 * the count, the subtotal and the "Add all" action can never disagree about
 * which items they mean.
 *
 * Availability uses strict `=== false` throughout: `null` means unknown and must
 * never block purchase (unknown stock is not out of stock).
 */
export function useWishlistSelection(items: HydratedWishlistItem[]): WishlistSelection {
  const customerType = useCustomerAuthStore((s) => s.customerType)

  function displayPriceOf(item: HydratedWishlistItem): number | null {
    return getDisplayPrice(
      {
        retailPrice: item.retailPrice?.price ?? null,
        wholesalePrice: item.wholesalePrice?.price ?? null,
        retailSalePrice: item.retailSalePrice?.active ? item.retailSalePrice.price : null,
        wholesaleSalePrice: item.wholesaleSalePrice?.active ? item.wholesaleSalePrice.price : null,
      },
      customerType,
    ).price
  }

  // A disabled product or a non-purchasable variant can NEVER reach the cart.
  function isPurchasable(item: HydratedWishlistItem): boolean {
    if (item.productActive === false) return false
    if (item.inStock === false) return false
    return displayPriceOf(item) != null
  }

  const unavailableItems = items.filter((i) => i.productActive === false)
  const availableItems = items.filter((i) => i.productActive !== false)
  const purchasableItems = availableItems.filter(isPurchasable)
  const estimatedSubtotal = purchasableItems.reduce(
    (sum, item) => sum + (displayPriceOf(item) ?? 0),
    0,
  )

  return { availableItems, unavailableItems, purchasableItems, estimatedSubtotal, isPurchasable }
}
