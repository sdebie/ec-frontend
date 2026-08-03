import { CartItemRow } from './CartItemRow'
import type { CartRow } from '../types'

interface CartItemsProps {
    rows: CartRow[]
    isLoading: boolean
    onQuantityChange: (variantId: string, quantity: number) => void
    onRemove: (variantId: string) => void
}

/**
 * The cart lines, in the order they were added. A real list element: a cart is
 * an enumerable set of things the shopper is reviewing, so assistive tech should
 * hear how many there are.
 */
export function CartItems({rows, isLoading, onQuantityChange, onRemove}: CartItemsProps) {
    return (
        <ul aria-label="Cart items" className="flex flex-col gap-3">
            {rows.map((row) => (
                <CartItemRow
                    key={row.variantId}
                    row={row}
                    isLoading={isLoading}
                    onQuantityChange={(quantity) => onQuantityChange(row.variantId, quantity)}
                    onRemove={() => onRemove(row.variantId)}
                />
            ))}
        </ul>
    )
}
