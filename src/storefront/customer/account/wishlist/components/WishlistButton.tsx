import {Heart} from 'lucide-react'
import {Link} from 'react-router-dom'
import React from 'react'
import {cn} from '@/shared/utils/cn'
import {SF_FOCUS_RING} from '@/storefront/sections/shared/focusRing'
import {useEffectiveWishlist} from '../hooks/useEffectiveWishlist'
import {useToggleEffective} from '../hooks/useToggleEffective'

/**
 * The chip both affordances below are drawn on: a round button-sized target with
 * a transparent border reserved so highlighting it cannot shift the layout.
 *
 * Deliberately NOT exported. Callers were previously handed this string and
 * pasted it into their own `className`, which meant every new consumer had to
 * know the recipe and could drift from it. The components own their appearance;
 * a caller passes only layout extras (position, size) through `className`.
 */
const CHIP =
    'group/wishlist inline-flex items-center justify-center rounded-full border border-transparent bg-(--sf-panel)/80 p-1.5 backdrop-blur-sm transition-colors hover:border-(--sf-accent) hover:bg-(--sf-panel) cursor-pointer'

/**
 * The heart itself.
 *
 * Fill is named explicitly rather than via `fill-current`: lucide sets a
 * `fill="none"` presentation attribute and `fill-current` emitted no CSS in this
 * build, so a saved heart silently stayed an outline. `fill-(--sf-accent)` is
 * the same token the stroke uses.
 *
 * `group/wishlist` is a NAMED group (set on the chip): a card root already
 * carries a bare `group` for its image zoom and quick-view reveal, so an
 * unnamed `group-hover` here would fill the heart from anywhere on the card.
 */
function HeartIcon({filled}: { filled: boolean }) {
    return (
        <Heart
            aria-hidden="true"
            className={cn(
                'h-5 w-5 text-(--sf-accent) transition-colors',
                filled ? 'fill-(--sf-accent)' : 'fill-none group-hover/wishlist:fill-(--sf-accent)',
            )}
        />
    )
}

/**
 * Saves or removes a VARIANT. Use wherever a variant is known; where one is not
 * (a variable product on a card), use {@link WishlistPromptLink} instead.
 *
 * `className` is for placement only — a card overlays it with `absolute …`, a
 * page sizes it inline.
 */
export function WishlistButton({variantId, className}: { variantId: string; className?: string }) {
    const {variantIds} = useEffectiveWishlist()
    const {toggle} = useToggleEffective()

    const isInWishlist = variantIds.has(variantId)

    function handleClick(e: React.MouseEvent) {
        e.preventDefault()
        e.stopPropagation()
        toggle(variantId, !isInWishlist)
    }

    return (
        <button
            type="button"
            onClick={handleClick}
            aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            aria-pressed={isInWishlist}
            className={cn(CHIP, SF_FOCUS_RING.page, className)}
        >
            <HeartIcon filled={isInWishlist}/>
        </button>
    )
}

/**
 * The same chip for a product with NO single variant. The wishlist is keyed by
 * variant throughout (toggle, hydration, sign-in merge), so there is nothing
 * such a product could save — rather than silently saving an arbitrary variant,
 * the heart becomes a door to the product page where one gets chosen. The
 * accessible name says so, so it never reads as a save that failed.
 */
export function WishlistPromptLink({productUrl, className}: { productUrl: string; className?: string }) {
    return (
        <Link
            to={productUrl}
            aria-label="Choose options to save to wishlist"
            title="Choose options to save"
            className={cn(CHIP, SF_FOCUS_RING.page, className)}
        >
            <HeartIcon filled={false}/>
        </Link>
    )
}
