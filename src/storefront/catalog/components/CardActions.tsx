import {useEffect, useRef, useState} from 'react'
import {Link} from 'react-router-dom'
import {useCartStore} from '@/storefront/cart/store/cartStore'
import {ACCENT_BUTTON_HOVER, SF_FOCUS_RING_PAGE} from '@/storefront/sections/shared'
import {QuantityStepper} from './QuantityStepper'

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
     * When provided, clicking "Add to cart" calls this with the chosen quantity
     * and NOTHING is written here — the consumer owns the flow (e.g. the wishlist
     * confirms in a dialog, then adds and removes the item). Absent: the button
     * adds to the cart directly, which is the catalogue's behaviour.
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
    const [quantity, setQuantity] = useState(1)
    const [showConfirmation, setShowConfirmation] = useState(false)
    const confirmationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        return () => {
            if (confirmationTimeoutRef.current) {
                clearTimeout(confirmationTimeoutRef.current)
            }
        }
    }, [])

    // In `bar` mode the wrapper disappears below sm so the controls inside it
    // become items of the PARENT's layout; from sm the original box returns.
    // Complete literal class strings — an interpolated `sm:${…}` never reaches
    // Tailwind's scanner and would emit no CSS.
    const singleClass = layout === 'bar' ? 'contents sm:mt-3 sm:block' : 'mt-3'
    const stackClass =
        layout === 'bar'
            ? 'contents sm:mt-3 sm:flex sm:flex-col sm:gap-2'
            : 'mt-3 flex flex-col gap-2'

    // No price → just a link to PDP
    if (!hasPrice) {
        return (
            <div className={singleClass}>
                <Link
                    to={`/products/${productSlug}`}
                    className="inline-block text-sm font-medium text-(--sf-accent) hover:underline"
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
                <Link
                    to={`/products/${productSlug}`}
                    className="inline-flex w-full items-center justify-center rounded-lg border border-(--sf-border) px-4 py-2 text-sm font-medium text-(--sf-text) hover:bg-(--sf-surface-muted) transition-colors"
                >
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
                    <Link
                        to={`/products/${productSlug}`}
                        className="inline-flex w-full items-center justify-center rounded-lg border border-(--sf-border) px-4 py-2 text-sm font-medium text-(--sf-text) hover:bg-(--sf-surface-muted) transition-colors"
                    >
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
                    className="w-full rounded-lg px-4 py-2 text-sm font-medium bg-(--sf-surface-muted) text-(--sf-muted-text) cursor-not-allowed"
                >
                    Out of stock
                </button>
            </div>
        )
    }

    // SIMPLE + in stock + has price
    function handleAddClick() {
        // Delegated mode: hand the intent to the consumer and write nothing here.
        if (onRequestAdd) {
            onRequestAdd(quantity)
            return
        }

        useCartStore.getState().addItem({
            variantId: variantId!,
            productName,
            variantLabel,
            quantity,
        })

        setQuantity(1)
        setShowConfirmation(true)
        if (confirmationTimeoutRef.current) {
            clearTimeout(confirmationTimeoutRef.current)
        }
        confirmationTimeoutRef.current = setTimeout(() => {
            setShowConfirmation(false)
        }, 4000)
    }

    return (
        <div className={stackClass}>
            <QuantityStepper
                quantity={quantity}
                onIncrement={() => setQuantity((q) => q + 1)}
                onDecrement={() => setQuantity((q) => Math.max(1, q - 1))}
            />
            <button
                type="button"
                onClick={handleAddClick}
                className={`w-full rounded-lg px-4 py-2 text-sm font-medium bg-(--sf-accent) text-(--sf-accent-text) transition-colors cursor-pointer ${ACCENT_BUTTON_HOVER} ${SF_FOCUS_RING_PAGE}`}
            >
                {showConfirmation ? 'Added \u2713' : 'Add to cart'}
            </button>
        </div>
    )
}
