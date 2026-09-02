import {create} from 'zustand'
import {persist} from 'zustand/middleware'

export interface LineItem {
    variantId: string
    quantity: number
}

export interface LineItemStore<TItem extends LineItem> {
    items: TItem[]
    itemCount: number
    addItem: (item: TItem) => void
    updateQty: (variantId: string, quantity: number) => void
    remove: (variantId: string) => void
    clear: () => void
}

const computeItemCount = <TItem extends LineItem>(items: TItem[]): number =>
    items.reduce((sum, item) => sum + item.quantity, 0)

/**
 * Builds a Zustand+persist store for a variant-keyed line-item list. Shared by
 * cart and quote-request, which need identical add/merge/remove/clear semantics
 * over different item shapes and persist keys.
 */
export function createLineItemStore<TItem extends LineItem>(persistKey: string) {
    return create<LineItemStore<TItem>>()(
        persist(
            (set) => ({
                items: [],
                itemCount: 0,
                addItem: (item) =>
                    set((state) => {
                        const existing = state.items.find((i) => i.variantId === item.variantId)
                        const items = existing
                            ? state.items.map((i) =>
                                i.variantId === item.variantId
                                    ? {...i, quantity: i.quantity + item.quantity}
                                    : i
                            )
                            : [...state.items, item]
                        return {items, itemCount: computeItemCount(items)}
                    }),
                updateQty: (variantId, quantity) =>
                    set((state) => {
                        const items =
                            quantity <= 0
                                ? state.items.filter((i) => i.variantId !== variantId)
                                : state.items.map((i) =>
                                    i.variantId === variantId ? {...i, quantity} : i
                                )
                        return {items, itemCount: computeItemCount(items)}
                    }),
                remove: (variantId) =>
                    set((state) => {
                        const items = state.items.filter((i) => i.variantId !== variantId)
                        return {items, itemCount: computeItemCount(items)}
                    }),
                clear: () => set({items: [], itemCount: 0}),
            }),
            {
                name: persistKey,
            }
        )
    )
}
