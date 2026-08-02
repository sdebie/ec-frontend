import {Link} from 'react-router-dom'
import {useCheckoutSessionStore} from '../store/checkoutSessionStore'
import {useStorefrontConfig} from '@/shared/config/storefrontConfig.context'
import {formatAmount} from '@/shared/utils/formatAmount'
import {useCartVariants} from '@/storefront/cart/hooks/useCartVariants'
import {pickFeaturedImage} from '@/storefront/catalog/utils/productImage'

interface OrderSummaryProps {
    /**
     * Delivery fee for the method the shopper has selected, or null while none
     * is chosen. Published by the server with the method — never derived here.
     */
    selectedShippingFee: number | null
}

/**
 * What is being bought and what it costs, beside the form and sticky on lg+ —
 * the same panel treatment the cart and wishlist use.
 *
 * Money: every component comes from the server. The subtotal and VAT are the
 * order's own figures; the delivery fee is the selected method's published fee.
 * The total sums those three exactly as `OrderService.computeTotals` does (VAT
 * is charged on the subtotal, never on delivery), and the server's recomputed
 * totals replace these the moment the order is placed. Nothing here derives a
 * price.
 *
 * Line identity: the order lines carry no image or SKU, so those are hydrated by
 * variant id through the cart's existing hook — for display only. Prices stay
 * the ones the server put on the order.
 */
export function OrderSummary({selectedShippingFee}: OrderSummaryProps) {
    const session = useCheckoutSessionStore((state) => state.session)
    const {currency, locale} = useStorefrontConfig()
    const {variants} = useCartVariants(session?.lines.map((line) => line.variantId) ?? [])

    if (!session) {
        return null
    }

    const deliveryKnown = selectedShippingFee !== null
    const total = deliveryKnown ? session.subtotal + session.vatAmount + selectedShippingFee : null

    return (
        <aside
            aria-labelledby="order-summary-heading"
            className="rounded-lg border border-(--sf-border) bg-(--sf-panel) p-5 lg:sticky lg:top-24 lg:p-6"
        >
            {/* The edit route sits beside the items themselves, which is where a
                shopper realises something is wrong. The toolbar's "Back to cart"
                is the navigational twin; this one is the contextual one. */}
            <div className="flex items-baseline justify-between gap-4">
                <h2 id="order-summary-heading" className="text-sm font-semibold text-(--sf-text)">
                    Order Summary
                </h2>
                <Link
                    to="/cart"
                    className="text-xs font-medium text-(--sf-muted-text) underline-offset-4 transition-colors hover:text-(--sf-text) hover:underline"
                >
                    Edit
                </Link>
            </div>

            {/* Below lg the lines are hidden and replaced by a count: the shopper
                reviewed them on the cart one step ago, and every row here pushes
                the form they came to fill further down the screen. The money —
                which is the thing that changes at checkout — always shows. */}
            <p className="mt-3 flex items-center justify-between text-sm lg:hidden">
                <span className="text-(--sf-muted-text)">Items</span>
                <span className="text-(--sf-text)" data-testid="summary-item-count">
                    {session.lines.length} {session.lines.length === 1 ? 'product' : 'products'}
                </span>
            </p>

            <ul role="list"
                className="mt-4 hidden flex-col gap-3 border-t border-(--sf-border) pt-4 lg:flex">
                {session.lines.map((line) => {
                    const variant = variants.get(line.variantId)
                    const imageUrl = variant ? pickFeaturedImage(variant.images) : null

                    return (
                        <li key={line.variantId} className="flex gap-3" data-testid="order-summary-line">
                            <div
                                className="h-14 w-14 shrink-0 overflow-hidden rounded bg-(--sf-surface-muted)">
                                {imageUrl && (
                                    <img
                                        src={imageUrl}
                                        alt=""
                                        loading="lazy"
                                        className="h-full w-full object-contain p-1"
                                    />
                                )}
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-(--sf-text)">{line.name}</p>
                                {variant?.sku && (
                                    <p className="mt-0.5 text-xs text-(--sf-muted-text)">
                                        SKU: {variant.sku}
                                    </p>
                                )}
                                <p className="mt-0.5 text-xs text-(--sf-muted-text)">
                                    {line.quantity} × {formatAmount(line.unitPrice, currency, locale)}
                                </p>
                            </div>

                            <p className="text-sm font-medium text-(--sf-text)">
                                {formatAmount(line.lineTotal, currency, locale)}
                            </p>
                        </li>
                    )
                })}
            </ul>

            <dl className="mt-4 space-y-3 border-t border-(--sf-border) pt-4 text-sm">
                <div className="flex items-center justify-between">
                    <dt className="text-(--sf-muted-text)">Subtotal</dt>
                    <dd className="text-(--sf-text)" data-testid="summary-subtotal">
                        {formatAmount(session.subtotal, currency, locale)}
                    </dd>
                </div>

                <div className="flex items-center justify-between">
                    <dt className="text-(--sf-muted-text)">VAT</dt>
                    <dd className="text-(--sf-text)" data-testid="summary-vat">
                        {formatAmount(session.vatAmount, currency, locale)}
                    </dd>
                </div>

                <div className="flex items-center justify-between">
                    <dt className="text-(--sf-muted-text)">Delivery</dt>
                    <dd className="text-(--sf-text)" data-testid="summary-delivery">
                        {deliveryKnown ? formatAmount(selectedShippingFee, currency, locale) : 'Choose a method'}
                    </dd>
                </div>

                <div
                    className="flex items-baseline justify-between border-t border-(--sf-border) pt-3">
                    <dt className="font-medium text-(--sf-text)">Total</dt>
                    <dd className="text-base font-semibold text-(--sf-text)" data-testid="summary-total">
                        {total !== null ? formatAmount(total, currency, locale) : '—'}
                    </dd>
                </div>
            </dl>

            <p className="mt-2 text-xs text-(--sf-muted-text)">
                {deliveryKnown ? 'Includes VAT and delivery.' : 'VAT included; delivery is added when you choose a method.'}
            </p>
        </aside>
    )
}
