import { Trash2 } from 'lucide-react'
import { useStorefrontConfig } from '@/shared/config/storefrontConfig.context'
import { formatAmount } from '@/shared/utils/formatAmount'
import { QuantityStepper } from '@/storefront/catalog/components/QuantityStepper'
import type { CartRow } from '../types'

interface CartItemRowProps {
    row: CartRow
    /** Prices are still loading — the identity of the line is shown regardless. */
    isLoading: boolean
    onQuantityChange: (quantity: number) => void
    onRemove: () => void
}

function PriceSkeleton() {
    return <span className="inline-block h-5 w-20 bg-(--sf-surface-muted) rounded animate-pulse"/>
}

/**
 * One cart line, shaped so the shopper can verify it at a glance: thumbnail,
 * name, SKU, variant and stock state on the left; unit price, quantity and line
 * total on the right.
 *
 * Deliberately NOT a `ProductCard` variant (law 4). A cart line's quantity is
 * persisted state being edited, not a pre-purchase choice, and it carries a
 * line total and a remove control the card has no concept of. Teaching the
 * shared card about carts is capability creep. It reuses the pieces that DO
 * transfer: `QuantityStepper`, `formatAmount`, the card's visual vocabulary.
 *
 * Blocking states (unavailable / out of stock / over stock / no price) each
 * carry their own message, because "remove this to continue" is only actionable
 * if the shopper knows why.
 */
export function CartItemRow({row, isLoading, onQuantityChange, onRemove}: CartItemRowProps) {
    const {currency, locale} = useStorefrontConfig()

    // Only a positive known stock is a limit; null (unknown) leaves the stepper
    // unbounded rather than trapping the shopper at their current quantity.
    const stepperMax = row.stockQuantity != null && row.stockQuantity > 0 ? row.stockQuantity : undefined

    return (
        <li
            data-testid="cart-line-item"
            data-blocked={row.isOrderable ? undefined : 'true'}
            /* A grid, not nested flexes, so ONE set of nodes reflows between
               breakpoints. Mobile: [thumb][identity] with the actions bar
               spanning both columns underneath. sm+: the actions return to a
               third column beside the identity. */
            className={`relative grid grid-cols-[auto_1fr] items-start gap-3 rounded-lg border bg-(--sf-panel) p-3 transition-colors sm:grid-cols-[auto_1fr_auto] sm:gap-4 sm:p-4 ${
                row.isOrderable ? 'border-(--sf-border)/60' : 'border-(--sf-error-border)'
            }`}
        >
            {/* Thumbnail — same object-contain stage as the catalogue card, so a
                product looks identical to how it looked when it was added. */}
            <div
                className="h-20 w-20 shrink-0 overflow-hidden rounded bg-(--sf-surface-muted) sm:h-24 sm:w-24">
                {row.imageUrl ? (
                    <img
                        src={row.imageUrl}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-contain p-1.5 sm:p-2"
                    />
                ) : (
                    <div
                        className="flex h-full w-full items-center justify-center text-(--sf-muted-text)"
                        aria-hidden="true"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none"
                             viewBox="0 0 24 24" stroke="currentColor">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
                            />
                        </svg>
                    </div>
                )}
            </div>

                {/* Identity — what the shopper checks the line against. `pr-9`
                    reserves the corner the remove control occupies on mobile so a
                    long product name never runs under it. */}
                <div className="flex min-w-0 flex-col pr-9 sm:pr-0">
                    <p className="text-sm font-medium text-(--sf-text)">{row.productName}</p>

                    {row.sku && (
                        <p className="mt-1 text-xs text-(--sf-muted-text)">SKU: {row.sku}</p>
                    )}

                    {row.variantLabel && (
                        <p className="mt-1 text-xs text-(--sf-muted-text)">{row.variantLabel}</p>
                    )}

                    {/* Stock state — one line, highest-severity message wins */}
                    {row.isUnavailable ? (
                        <p className="mt-1 text-xs font-medium text-(--sf-error)">
                            No longer available — remove it to continue
                        </p>
                    ) : row.isCheckoutFlagged ? (
                        <p className="mt-1 text-xs font-medium text-(--sf-error)">
                            Couldn't be confirmed at checkout — remove it to continue
                        </p>
                    ) : row.isOutOfStock ? (
                        <p className="mt-1 text-xs font-medium text-(--sf-error)">
                            Out of stock — remove it to continue
                        </p>
                    ) : row.exceedsStock ? (
                        <p className="mt-1 text-xs font-medium text-(--sf-error)">
                            Only {row.stockQuantity} in stock — reduce the quantity to continue
                        </p>
                    ) : !isLoading && row.unitPrice === null ? (
                        <p className="mt-1 text-xs font-medium text-(--sf-error)">
                            Price unavailable — remove it to continue
                        </p>
                    ) : row.stockQuantity != null && row.stockQuantity > 0 ? (
                        <p className="mt-1 text-xs font-medium text-(--sf-success)">In stock</p>
                    ) : null}
                </div>

            {/* Actions. Mobile: a full-width bar under the thumbnail and identity,
                reading left-to-right as "how many → how much". sm+: a right-hand
                column, stepper above the money it produces. */}
            <div
                className="col-span-2 flex items-center justify-between gap-3 border-t border-(--sf-border)/60 pt-3 sm:col-span-1 sm:w-52 sm:flex-col sm:items-end sm:justify-start sm:gap-2 sm:border-t-0 sm:pt-0">
                <div className="flex items-center gap-3 sm:justify-end">
                    <QuantityStepper
                        quantity={row.quantity}
                        max={stepperMax}
                        onIncrement={() => onQuantityChange(row.quantity + 1)}
                        onDecrement={() => onQuantityChange(row.quantity - 1)}
                    />

                    {/* Remove. On mobile it leaves the flow and takes the row's
                        top-right corner — the wishlist's remove position — which
                        keeps a destructive control with no undo away from the "+"
                        it would otherwise sit beside on a touch target. At sm+ it
                        rejoins the stepper, where a pointer makes the proximity
                        safe. Positioned, never duplicated: exactly ONE remove
                        control exists in the DOM. Styling matches the wishlist's
                        chip — muted until hover, then accent, with an
                        always-present transparent border so nothing shifts. */}
                    <button
                        type="button"
                        onClick={onRemove}
                        aria-label={`Remove ${row.productName} from cart`}
                        title="Remove from cart"
                        className="absolute top-2 right-2 cursor-pointer rounded-full border border-transparent p-1.5 text-(--sf-muted-text) transition-colors hover:border-(--sf-accent) hover:text-(--sf-accent) sm:static"
                    >
                        <Trash2 className="h-5 w-5" aria-hidden="true"/>
                    </button>
                </div>

                <div className="text-right">
                    <div className="text-sm font-semibold text-(--sf-text)">
                        {isLoading ? (
                            <PriceSkeleton/>
                        ) : (
                            <>
                                <span className="mr-1 text-xs font-normal text-(--sf-muted-text)">
                                    Line total
                                </span>
                                <span data-testid="cart-line-total">
                                    {formatAmount(row.lineTotal, currency, locale)}
                                </span>
                            </>
                        )}
                    </div>

                    <div className="mt-0.5 text-xs text-(--sf-muted-text)">
                        {isLoading ? (
                            <PriceSkeleton/>
                        ) : (
                            <>
                                <span data-testid="cart-unit-price">
                                    {formatAmount(row.unitPrice, currency, locale)}
                                </span>{' '}
                                ex. VAT each
                            </>
                        )}
                    </div>
                </div>
            </div>
        </li>
    )
}
