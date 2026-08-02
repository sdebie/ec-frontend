import { Trash2 } from 'lucide-react'

interface WishlistItemActionsProps {
  productName: string
  onRemove: () => void
}

/**
 * Per-item remove control, owned by the WISHLIST rather than by the shared
 * ProductCard. It is rendered as a sibling of the card inside a `relative`
 * wrapper and positioned over the card's top-right corner, so it reads as part
 * of the card without the shared component knowing anything about wishlists.
 *
 * The chip treatment (translucent panel, backdrop blur, rounded) deliberately
 * mirrors the card's own overlay controls — the wishlist heart and quick-view
 * button — so an overlay added from outside is visually indistinguishable from
 * one added inside. The card's heart is suppressed here
 * (`showWishlistButton={false}`), leaving exactly one remove affordance.
 */
export function WishlistItemActions({ productName, onRemove }: WishlistItemActionsProps) {
  // The border is always present but transparent until hover, so the outline
  // appearing does not shift the icon by a pixel — only its colour changes.
  return (
    <button
      type="button"
      onClick={onRemove}
      aria-label={`Remove ${productName} from wishlist`}
      title="Remove from wishlist"
      className="absolute top-2 right-2 z-10 cursor-pointer rounded-full border border-transparent bg-(--sf-panel)/80 p-1.5 text-(--sf-muted-text) backdrop-blur-sm transition-colors hover:border-(--sf-accent) hover:bg-(--sf-panel) hover:text-(--sf-accent)"
    >
      {/* h-5 w-5 + p-1.5 reproduces the card heart's 32px chip exactly, so the
          two overlay controls are the same size across catalogue and wishlist. */}
      <Trash2 className="h-5 w-5" aria-hidden="true" />
    </button>
  )
}
