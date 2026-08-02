import {Link} from 'react-router-dom'
import {useStorefrontConfig} from '@/shared/config/storefrontConfig.context'
import {formatAmount} from '@/shared/utils/formatAmount'
import type {HydratedWishlistItem} from '../types'

interface WishlistSummaryProps {
    items: HydratedWishlistItem[]
    /** Items eligible to move to the cart — computed by the page so the count, the
     *  subtotal and the action can never disagree about which items they mean. */
    purchasableItems: HydratedWishlistItem[]
    unavailableCount: number
    estimatedSubtotal: number
    /** Transient count shown after a completed move; null when idle. */
    movedConfirmation: number | null
    onRequestMoveAll: () => void
    onRequestRemoveAll: () => void
    onRequestRemoveUnavailable: () => void
}

/**
 * Presentational summary panel: saved count, ready-to-add count, estimated
 * subtotal, and the bulk actions. It raises intents only — the page owns every
 * mutation and every confirmation dialog, so there is exactly one place where
 * the cart and the wishlist are written.
 *
 * Pricing: the subtotal is computed by the page by SUMMING backend-selected
 * display prices — never derived here. Displayed ex-VAT and explicitly
 * provisional, matching CartPage's "Estimated subtotal" treatment.
 */
export function WishlistSummary({
                                    items,
                                    purchasableItems,
                                    unavailableCount,
                                    estimatedSubtotal,
                                    movedConfirmation,
                                    onRequestMoveAll,
                                    onRequestRemoveAll,
                                    onRequestRemoveUnavailable,
                                }: WishlistSummaryProps) {
    const {currency, locale} = useStorefrontConfig()

    const n = purchasableItems.length
    const k = unavailableCount
    const savedLabel = `${items.length} ${items.length === 1 ? 'item' : 'items'} saved`
    const addAllLabel = movedConfirmation != null ? `Moved ${movedConfirmation} ${movedConfirmation === 1 ? 'item' : 'items'} to cart ✓` : `Add all to cart (${n})`

    return (
        <aside
            aria-label="Wishlist summary"
            className="rounded-lg border border-(--sf-border) bg-(--sf-panel) p-4 lg:sticky lg:top-24"
        >
            {/* Below lg the panel stays deliberately short: every row it adds pushes the
          saved items further below the fold, so the heading and the "Saved" line
          are desktop-only and the secondary actions collapse into the text row. */}
            <h2 className="hidden text-sm font-semibold text-(--sf-text) lg:block">Summary</h2>

            <dl className="space-y-2 text-sm lg:mt-3 lg:border-t lg:border-(--sf-border) lg:pt-3">
                <div className="hidden items-center justify-between lg:flex">
                    <dt className="text-(--sf-muted-text)">
                        Saved
                    </dt>
                    <dd className="text-(--sf-text)">
                        {savedLabel}
                    </dd>
                </div>
                <div className="flex items-center justify-between">
                    <dt className="text-(--sf-muted-text)">
                        Ready to add
                    </dt>
                    <dd className="text-(--sf-text)">
                        {n} of {items.length}
                    </dd>
                </div>
                <div className="flex items-baseline justify-between lg:pt-1">
                    <dt className="font-medium text-(--sf-text)">Estimated subtotal</dt>
                    <dd className="text-base font-semibold text-(--sf-text)">
                        {formatAmount(estimatedSubtotal, currency, locale)}
                    </dd>
                </div>
            </dl>

            <p className="mt-1 text-xs text-(--sf-muted-text)">
                Ex. VAT — final total confirmed at checkout
            </p>

            <div className="mt-3 flex flex-col gap-2 lg:mt-4">
                <button
                    type="button"
                    disabled={n === 0}
                    onClick={onRequestMoveAll}
                    className="min-h-11 w-full cursor-pointer rounded-lg bg-(--sf-accent) px-4 py-2 text-sm font-medium text-(--sf-accent-text) transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {addAllLabel}
                </button>

                {/* One element, styled per breakpoint: a compact text link on mobile (every
            pixel above the list costs a visible item) and a full-width secondary
            button at lg+. Deliberately NOT duplicated per breakpoint — two hidden
            copies would be two links to assistive tech and to the DOM. */}
                <Link
                    to="/products"
                    className="inline-flex w-full items-center justify-center rounded-lg px-4 py-1 text-xs font-medium text-(--sf-muted-text) transition-colors hover:text-(--sf-text) lg:min-h-11 lg:border lg:border-(--sf-border) lg:py-2 lg:text-sm lg:text-(--sf-text) lg:hover:bg-(--sf-surface-muted)"
                >
                    Continue shopping
                </Link>
            </div>

            {/* Destructive actions — de-emphasised and centred below the primary pair */}
            <div
                className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t border-(--sf-border) pt-3 lg:mt-4">
                <button
                    type="button"
                    onClick={onRequestRemoveAll}
                    className="cursor-pointer text-xs font-medium text-(--sf-muted-text) underline-offset-4 transition-colors hover:text-(--sf-text) hover:underline"
                >
                    Remove all
                </button>

                {k >= 1 && (
                    <button
                        type="button"
                        onClick={onRequestRemoveUnavailable}
                        className="cursor-pointer text-xs font-medium text-(--sf-muted-text) underline-offset-4 transition-colors hover:text-(--sf-text) hover:underline"
                    >
                        Remove unavailable ({k})
                    </button>
                )}
            </div>
        </aside>
    )
}
