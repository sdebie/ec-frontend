import {useEffect, useRef, useState} from 'react'
import {Link} from 'react-router-dom'
import {useCartStore} from '@/storefront/cart/cartStore'
import {QuantityStepper} from './QuantityStepper'

interface CardActionsProps {
    variantId: string | null
    productName: string
    productSlug: string
    inStock: boolean | null
    hasPrice: boolean
}

export function CardActions({variantId, productName, productSlug, inStock, hasPrice}: CardActionsProps) {
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

    // No price → just a link to PDP
    if (!hasPrice) {
        return (
            <div className="mt-3">
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
            <div className="mt-3">
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
        return (
            <div className="mt-3">
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
    function handleAddToCart() {
        useCartStore.getState().addItem({
            variantId: variantId!,
            productName,
            variantLabel: '',
            quantity,
        })

        setShowConfirmation(true)
        setQuantity(1)

        if (confirmationTimeoutRef.current) {
            clearTimeout(confirmationTimeoutRef.current)
        }
        confirmationTimeoutRef.current = setTimeout(() => {
            setShowConfirmation(false)
        }, 4000)
    }

    return (
        <div className="mt-3 flex items-center gap-2">
            <QuantityStepper
                quantity={quantity}
                onIncrement={() => setQuantity((q) => q + 1)}
                onDecrement={() => setQuantity((q) => Math.max(1, q - 1))}
            />
            <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 rounded-lg px-4 py-2 text-sm font-medium bg-(--sf-accent) text-(--sf-accent-text) hover:opacity-90 transition-colors cursor-pointer"
            >
                {showConfirmation ? 'Added \u2713' : 'Add to cart'}
            </button>
        </div>
    )
}
