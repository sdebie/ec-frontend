import {Section, SectionHeading} from '@/storefront/sections/shared'
import {useCartStore} from './store/cartStore'
import {useCartVariants} from './hooks/useCartVariants'
import {useCheckout} from './hooks/useCheckout'
import {estimateSubtotal, toCartRows} from './mappers'
import {CartEmptyState} from './components/CartEmptyState'
import {CartItems} from './components/CartItems'
import {CartSummary} from './components/CartSummary'

/**
 * Orchestrates the cart: loads what the catalogue currently says about the
 * persisted lines, derives the rows once, and owns the only two mutations —
 * quantity changes and removals.
 *
 * Presentation is delegated: `CartItems` renders the lines, `CartSummary` the
 * totals and the checkout commitment, `CartEmptyState` the empty case. The page
 * shell matches the catalogue and the wishlist — `Section as="div"` with the
 * items beside a sticky summary.
 */
export function CartPage() {
    const {items, updateQty, remove} = useCartStore()
    const variantIds = items.map((i) => i.variantId)
    const {variants, unavailableIds, isLoading} = useCartVariants(variantIds)
    const {
        checkout,
        isLoading: checkoutLoading,
        unavailableVariantIds: checkoutUnavailable,
        error: checkoutError,
    } = useCheckout()

    const heading = <SectionHeading as="h1" title="Your Cart" className="mb-0"/>

    if (items.length === 0) {
        return (
            <Section as="div">
                <div className="space-y-6">
                    {heading}
                    <CartEmptyState/>
                </div>
            </Section>
        )
    }

    const rows = toCartRows({
        items,
        variants,
        unavailableIds,
        checkoutFlaggedIds: checkoutUnavailable,
    })
    const blockedCount = rows.filter((row) => !row.isOrderable).length
    const unitCount = items.reduce((sum, item) => sum + item.quantity, 0)

    return (
        <Section as="div">
            <div className="space-y-6">
                {heading}

                {/* Toolbar row — the catalogue's and the wishlist's rhythm: one
                    right-aligned line of context above a divider. */}
                <div className="flex items-center justify-end border-b border-(--sf-border) pb-4">
                    <p className="text-sm text-(--sf-muted-text)">
                        {unitCount} {unitCount === 1 ? 'item' : 'items'} ready for checkout
                    </p>
                </div>

                {/* Items beside a sticky summary on lg+; below lg the summary
                    stacks FIRST so the total and the checkout action stay
                    reachable without scrolling past the lines. */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
                    <div className="lg:col-span-2">
                        <CartItems
                            rows={rows}
                            isLoading={isLoading}
                            onQuantityChange={updateQty}
                            onRemove={remove}
                        />

                        {/* The summary carries these two lines on lg+, where it has
                            the room. Below lg they live here instead, so the panel
                            above the products stays short. Only ever one copy is
                            in the accessibility tree — the other is display:none. */}
                        <div className="mt-6 space-y-1 text-center text-xs text-(--sf-muted-text) lg:hidden">
                            <p>Delivery and payment are confirmed on the next step.</p>
                        </div>
                    </div>

                    <div className="order-first lg:order-none">
                        <CartSummary
                            lineCount={rows.length}
                            unitCount={unitCount}
                            estimatedSubtotal={estimateSubtotal(rows)}
                            blockedCount={blockedCount}
                            isLoading={isLoading}
                            checkoutLoading={checkoutLoading}
                            checkoutError={checkoutError}
                            onCheckout={checkout}
                        />
                    </div>
                </div>
            </div>
        </Section>
    )
}
