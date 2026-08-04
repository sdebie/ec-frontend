import {useEffect, useRef, useState} from 'react'
import {Link} from 'react-router-dom'
import {useCartStore} from '@/storefront/cart/store/cartStore'
import {ACCENT_BUTTON_HOVER, SF_FOCUS_RING_PAGE} from '@/storefront/sections/shared'

/**
 * The card's single action control. Every branch renders exactly one of these,
 * so cards are the same height whether they buy, choose options or link out —
 * this is what replaced the reserved stepper row that used to do that job.
 *
 * `primary` is the accent-filled treatment. "Select options" uses it too
 * (owner directive 2026-08-03): it is the equivalent forward step for a variable
 * product, and an outlined control beside a filled one read as disabled.
 * `muted` stays reserved for genuinely unavailable states.
 *
 * border-transparent on the filled variants matches the 1px the outlined ones
 * carry, so the two are exactly the same height.
 *
 * `relative z-10` lifts the control above ProductCard's stretched product link,
 * which covers the whole card — without it "Add to cart" would navigate to the
 * product page instead of adding. It goes on the control rather than on the
 * wrapper because in `bar` mode that wrapper is `display: contents` below `sm`
 * and can carry neither position nor stacking.
 */
const ACTION_BASE = 'relative z-10 inline-flex w-full items-center justify-center rounded-lg border px-4 py-2 text-sm font-medium transition-colors'
const ACTION_PRIMARY = `${ACTION_BASE} border-transparent bg-(--sf-accent) text-(--sf-accent-text) ${ACCENT_BUTTON_HOVER} ${SF_FOCUS_RING_PAGE}`
const ACTION_MUTED = `${ACTION_BASE} border-(--sf-border) text-(--sf-text) hover:bg-(--sf-surface-muted)`

interface CardActionsProps {
    variantId: string | null
    productName: string
    productSlug: string
    inStock: boolean | null
    hasPrice: boolean
    outOfStockAction?: 'disabled' | 'viewProduct'
    variantLabel?: string
    /**
     * Delegates the add action to the consumer instead of writing to the cart.
     * When provided, clicking "Add to cart" calls this with the quantity and
     * NOTHING is written here — the consumer owns the flow (e.g. the wishlist
     * confirms in a dialog, then adds and removes the item). Absent: the button
     * adds to the cart directly, which is the catalogue's behaviour.
     *
     * The card no longer has a quantity control (owner directive 2026-08-03), so
     * this is always called with 1. The parameter stays because the contract is
     * "add this many", not "add one" — the wishlist's bulk path and any future
     * quantity affordance feed the same call, and the cart is where quantity is
     * actually edited.
     */
    onRequestAdd?: (quantity: number) => void
    /**
     * How the controls sit in their parent.
     *
     * `stack` (default) — this component paints its own column: stepper above a
     * full-width button.
     *
     * `bar` — below `sm` the component contributes NO box of its own
     * (`display: contents`), so the stepper and the button become items of the
     * parent's layout. A parent that wraps can then put the stepper beside its
     * own content and let the full-width button fall onto the line below. From
     * `sm` it stacks exactly as `stack` does. Used by the row layout, whose
     * mobile bar shares a line with the price.
     */
    layout?: 'stack' | 'bar'
}

export function CardActions({variantId, productName, productSlug, inStock, hasPrice, outOfStockAction = 'disabled', variantLabel = '', onRequestAdd, layout = 'stack'}: CardActionsProps) {
    const [showConfirmation, setShowConfirmation] = useState(false)
    const confirmationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        return () => {
            if (confirmationTimeoutRef.current) {
                clearTimeout(confirmationTimeoutRef.current)
            }
        }
    }, [])

    // In `bar` mode the wrapper disappears below sm so the control inside it
    // becomes an item of the PARENT's layout; from sm the original box returns.
    // Complete literal class strings — an interpolated `sm:${…}` never reaches
    // Tailwind's scanner and would emit no CSS.
    //
    // Every branch renders a single control of identical height, so there is
    // nothing left to reserve — the QuantityStepperPlaceholder that used to keep
    // mixed decks aligned went out with the stepper itself.
    const singleClass = layout === 'bar' ? 'contents sm:mt-3 sm:block' : 'mt-3'

    // No price → just a link to PDP
    if (!hasPrice) {
        return (
            <div className={singleClass}>
                <Link
                    to={`/products/${productSlug}`}
                    className="relative z-10 inline-block text-sm font-medium text-(--sf-accent) hover:underline"
                >
                    View product
                </Link>
            </div>
        )
    }

    // VARIABLE product (variantId is null) → Select options link
    if (variantId == null) {
        return (
            <div className={singleClass}>
                <Link to={`/products/${productSlug}`} className={ACTION_PRIMARY}>
                    Select options
                </Link>
            </div>
        )
    }

    // SIMPLE + known out of stock. Strictly `=== false`: consumers whose queries
    // don't select inStock pass null (unknown), and unknown must not block
    // purchase — stock is import-derived and checkout does not enforce it.
    if (inStock === false) {
        if (outOfStockAction === 'viewProduct') {
            return (
                <div className={singleClass}>
                    <Link to={`/products/${productSlug}`} className={ACTION_MUTED}>
                        View product
                    </Link>
                </div>
            )
        }

        return (
            <div className={singleClass}>
                <button
                    type="button"
                    disabled
                    className={`${ACTION_BASE} border-transparent bg-(--sf-surface-muted) text-(--sf-muted-text) cursor-not-allowed`}
                >
                    Out of stock
                </button>
            </div>
        )
    }

    // SIMPLE + in stock + has price. The card adds exactly one; quantity is
    // edited in the cart, which is the one place it can be reconciled against
    // stock and price.
    function handleAddClick() {
        // Delegated mode: hand the intent to the consumer and write nothing here.
        if (onRequestAdd) {
            onRequestAdd(1)
            return
        }

        useCartStore.getState().addItem({
            variantId: variantId!,
            productName,
            variantLabel,
            quantity: 1,
        })

        setShowConfirmation(true)
        if (confirmationTimeoutRef.current) {
            clearTimeout(confirmationTimeoutRef.current)
        }
        confirmationTimeoutRef.current = setTimeout(() => {
            setShowConfirmation(false)
        }, 4000)
    }

    return (
        <div className={singleClass}>
            <button
                type="button"
                onClick={handleAddClick}
                className={`${ACTION_PRIMARY} cursor-pointer`}
            >
                {showConfirmation ? 'Added \u2713' : 'Add to cart'}
            </button>
        </div>
    )
}
