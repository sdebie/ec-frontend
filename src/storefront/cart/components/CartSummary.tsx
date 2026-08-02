import {Link} from 'react-router-dom'
import {useStorefrontConfig} from '@/shared/config/storefrontConfig.context'
import {formatAmount} from '@/shared/utils/formatAmount'
import {ACCENT_BUTTON_HOVER, SF_FOCUS_RING_PAGE} from '@/storefront/sections/shared'

interface CartSummaryProps {
    /** Distinct lines in the cart. */
    lineCount: number
    /** Total units across all lines. */
    unitCount: number
    /** Sum of the orderable lines, ex VAT. */
    estimatedSubtotal: number
    /** Lines that cannot be ordered as they stand. */
    blockedCount: number
    isLoading: boolean
    checkoutLoading: boolean
    checkoutError: string | null
    onCheckout: () => void
}

/**
 * The purchase, stated plainly: what is in the cart, what it costs so far, and
 * what is still to be decided. VAT and delivery are named as pending rather than
 * omitted — the shopper should never reach checkout and find a number they did
 * not expect. Both are computed by the backend at checkout (`TaxService` /
 * `ShippingService`), so the cart deliberately shows no figure for either.
 *
 * Presentational: it raises the checkout intent and owns no cart state.
 */
export function CartSummary({
                                lineCount,
                                unitCount,
                                estimatedSubtotal,
                                blockedCount,
                                isLoading,
                                checkoutLoading,
                                checkoutError,
                                onCheckout,
                            }: CartSummaryProps) {
    const {currency, locale} = useStorefrontConfig()

    const canCheckout = blockedCount === 0 && !checkoutLoading && lineCount > 0
    const itemsLabel = `${unitCount} ${unitCount === 1 ? 'item' : 'items'}`
    const linesLabel = `${lineCount} ${lineCount === 1 ? 'product' : 'products'}`

    return (
        <aside
            aria-label="Order Summary"
            className="rounded-lg border border-(--sf-border) bg-(--sf-panel) p-5 lg:sticky lg:top-24 lg:p-6"
        >
            {/* Below lg every row here pushes the first product further below the
                fold, so the panel keeps only what the shopper cannot infer from
                the page itself: the money and what is still to be added. The
                heading, the item recap (the toolbar already states it) and the
                saved-cart line are desktop-only. */}
            <h2 className="hidden text-sm font-semibold text-(--sf-text) lg:block">Summary</h2>

            <dl className="space-y-3 text-sm lg:mt-4 lg:border-t lg:border-(--sf-border) lg:pt-4">
                <div className="hidden items-center justify-between lg:flex">
                    <dt className="text-(--sf-muted-text)">In your cart</dt>
                    <dd className="text-(--sf-text)">
                        {itemsLabel} · {linesLabel}
                    </dd>
                </div>

                <div className="flex items-baseline justify-between">
                    <dt className="font-medium text-(--sf-text)">Estimated subtotal</dt>
                    <dd className="text-base font-semibold text-(--sf-text)">
                        {isLoading ? (
                            <span
                                className="inline-block h-5 w-20 animate-pulse rounded bg-(--sf-surface-muted)"/>
                        ) : (
                            <span data-testid="cart-subtotal">
                                {formatAmount(estimatedSubtotal, currency, locale)}
                            </span>
                        )}
                    </dd>
                </div>

                <div className="flex items-center justify-between">
                    <dt className="text-(--sf-muted-text)">VAT</dt>
                    <dd className="text-(--sf-text)">Added at checkout</dd>
                </div>

                <div className="flex items-center justify-between">
                    <dt className="text-(--sf-muted-text)">Delivery</dt>
                    <dd className="text-(--sf-text)">Calculated at checkout</dd>
                </div>
            </dl>

            {/* Desktop-only: below lg the VAT and Delivery rows above already say
                this, and the duplicate costs a visible product. */}
            <p className="mt-2 hidden text-xs text-(--sf-muted-text) lg:block">
                Ex. VAT — final total confirmed at checkout
            </p>

            <div className="mt-5 flex flex-col gap-3 lg:mt-6">
                {checkoutError && (
                    <p role="alert" className="text-sm text-(--sf-error)">
                        {checkoutError}
                    </p>
                )}

                <button
                    type="button"
                    disabled={!canCheckout}
                    onClick={onCheckout}
                    className={`min-h-11 w-full cursor-pointer rounded-lg bg-(--sf-accent) px-4 py-2 text-sm font-medium text-(--sf-accent-text) transition-colors ${ACCENT_BUTTON_HOVER} ${SF_FOCUS_RING_PAGE} disabled:cursor-not-allowed disabled:opacity-50`}
                >
                    {checkoutLoading ? 'Processing...' : 'Proceed to checkout'}
                </button>

                {/* Only the blocking message belongs beside the button — it is the
                    reason the button will not move. The reassurance lives in the
                    footer below. */}
                {blockedCount > 0 && (
                    <p className="text-center text-xs text-(--sf-error)">
                        {blockedCount === 1
                            ? 'Fix the flagged item above to continue.'
                            : `Fix the ${blockedCount} flagged items above to continue.`}
                    </p>
                )}

                <Link
                    to="/products"
                    className="inline-flex w-full items-center justify-center rounded-lg px-4 py-1 text-xs font-medium text-(--sf-muted-text) transition-colors hover:text-(--sf-text) lg:min-h-11 lg:border lg:border-(--sf-border) lg:py-2 lg:text-sm lg:text-(--sf-text) lg:hover:bg-(--sf-surface-muted)"
                >
                    Continue shopping
                </Link>
            </div>

            {/* The cart lives in this browser's storage — say that, and nothing
                more: there is no server-side cart to promise. Desktop-only here;
                on mobile both lines sit below the items, where they do not push
                products off the screen. */}
            <div
                className="mt-5 hidden space-y-1 border-t border-(--sf-border) pt-4 text-center text-xs text-(--sf-muted-text) lg:block lg:mt-6">
                <p>Delivery and payment are confirmed on the next step.</p>
            </div>
        </aside>
    )
}
