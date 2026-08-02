import {Link} from 'react-router-dom'
import {ACCENT_BUTTON_HOVER, SF_FOCUS_RING_PAGE} from '@/storefront/sections/shared'

/**
 * Empty cart. Framed as a stage in shopping rather than a dead end: one clear
 * way back into the catalogue, and the same saved-cart reassurance the filled
 * cart gives.
 */
export function CartEmptyState() {
    return (
        <div className="mt-6 rounded-lg border border-(--sf-border) bg-(--sf-panel) py-16 text-center">
            <h2 className="mb-2 text-xl font-semibold text-(--sf-text)">
                Your cart is empty
            </h2>
            <p className="mx-auto mb-6 max-w-md text-sm text-(--sf-muted-text)">
                Add products as you browse — your cart is saved on this device, so you can pick up
                where you left off.
            </p>
            <Link
                to="/products"
                className={`inline-block rounded-lg bg-(--sf-accent) px-6 py-3 font-medium text-(--sf-accent-text) transition-colors ${ACCENT_BUTTON_HOVER} ${SF_FOCUS_RING_PAGE}`}
            >
                Continue shopping
            </Link>
        </div>
    )
}
