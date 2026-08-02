import {beforeEach, describe, expect, it} from 'vitest'
import * as fc from 'fast-check'
import {create} from 'zustand'
import {createJSONStorage, persist} from 'zustand/middleware'
import type {CartLineItem, CartState} from '../store/cartStore'
import {useCartStore} from '../store/cartStore'

/**
 * Feature: cart-store
 * Property-based tests for the cart store.
 *
 * **Validates: Requirements 1.1, 1.2, 1.3, 1.7**
 */

// Generator: arbitrary CartLineItem with non-empty strings and positive integer quantity
const cartLineItemArb = fc.record({
    variantId: fc.string({minLength: 1}),
    productName: fc.string({minLength: 1}),
    variantLabel: fc.string({minLength: 1}),
    quantity: fc.nat().map((n) => n + 1), // positive integer (>= 1)
})

describe('cartStore — Property Tests', () => {
    beforeEach(() => {
        useCartStore.setState({items: [], itemCount: 0})
    })

    // Feature: cart-store, Property 1: Add item stores correct CartLineItem shape
    describe('Property 1: Add item stores correct CartLineItem shape', () => {
        it('for any valid CartLineItem, addItem stores an item matching those exact fields with no monetary fields', () => {
            fc.assert(
                fc.property(cartLineItemArb, (item) => {
                    useCartStore.setState({items: [], itemCount: 0})

                    useCartStore.getState().addItem(item)

                    const state = useCartStore.getState()
                    const stored = state.items.find((i) => i.variantId === item.variantId)

                    // Item must exist in the store
                    expect(stored).toBeDefined()

                    // All fields must match exactly
                    expect(stored!.variantId).toBe(item.variantId)
                    expect(stored!.productName).toBe(item.productName)
                    expect(stored!.variantLabel).toBe(item.variantLabel)
                    expect(stored!.quantity).toBe(item.quantity)

                    // No monetary fields shall be present
                    const keys = Object.keys(stored!)
                    expect(keys).not.toContain('price')
                    expect(keys).not.toContain('total')
                    expect(keys).not.toContain('unitPrice')
                    expect(keys).not.toContain('lineTotal')
                    expect(keys).not.toContain('subtotal')

                    // Exactly 4 fields
                    expect(keys).toHaveLength(4)
                    expect(keys.sort()).toEqual(
                        ['productName', 'quantity', 'variantId', 'variantLabel'].sort()
                    )
                }),
                {numRuns: 100}
            )
        })
    })

    // Feature: cart-store, Property 2: Duplicate variant merges quantities
    describe('Property 2: Duplicate variant merges quantities', () => {
        it('for any variantId and two positive quantities, adding the same variant twice results in one item with summed quantity', () => {
            fc.assert(
                fc.property(
                    fc.string({minLength: 1}),
                    fc.string({minLength: 1}),
                    fc.string({minLength: 1}),
                    fc.nat().map((n) => n + 1),
                    fc.nat().map((n) => n + 1),
                    (variantId, productName, variantLabel, q1, q2) => {
                        useCartStore.setState({items: [], itemCount: 0})

                        const item = {variantId, productName, variantLabel, quantity: q1}
                        useCartStore.getState().addItem(item)
                        useCartStore.getState().addItem({...item, quantity: q2})

                        const state = useCartStore.getState()
                        const matches = state.items.filter((i) => i.variantId === variantId)

                        // Exactly one entry for this variantId — no duplicates
                        expect(matches).toHaveLength(1)

                        // Quantity is the sum of both additions
                        expect(matches[0].quantity).toBe(q1 + q2)
                    }
                ),
                {numRuns: 100}
            )
        })
    })

    // Feature: cart-store, Property 3: Non-positive quantity removes item
    describe('Property 3: Non-positive quantity removes item', () => {
        it('for any cart with at least one item, updateQty with q <= 0 removes that item and leaves others unchanged', () => {
            fc.assert(
                fc.property(
                    // Generate 1-5 unique items for the cart
                    fc
                        .uniqueArray(cartLineItemArb, {
                            minLength: 1,
                            maxLength: 5,
                            selector: (item) => item.variantId,
                        }),
                    // Non-positive quantity (0 or negative)
                    fc.integer({min: -100, max: 0}),
                    (items, nonPositiveQty) => {
                        useCartStore.setState({items: [], itemCount: 0})

                        // Add all items to the cart
                        for (const item of items) {
                            useCartStore.getState().addItem(item)
                        }

                        // Pick the first item's variantId to update
                        const targetVariantId = items[0].variantId

                        // Capture other items before the update
                        const otherItemsBefore = useCartStore
                            .getState()
                            .items.filter((i) => i.variantId !== targetVariantId)

                        // Call updateQty with non-positive quantity
                        useCartStore.getState().updateQty(targetVariantId, nonPositiveQty)

                        const state = useCartStore.getState()

                        // Target item must be removed
                        const targetAfter = state.items.find(
                            (i) => i.variantId === targetVariantId
                        )
                        expect(targetAfter).toBeUndefined()

                        // All other items must remain unchanged
                        const otherItemsAfter = state.items.filter(
                            (i) => i.variantId !== targetVariantId
                        )
                        expect(otherItemsAfter).toEqual(otherItemsBefore)
                    }
                ),
                {numRuns: 100}
            )
        })
    })

    // Feature: cart-store, Property 5: itemCount invariant (sum of quantities)
    describe('Property 5: itemCount invariant (sum of quantities)', () => {
        it('itemCount always equals the sum of all item quantities', () => {
            fc.assert(
                fc.property(
                    fc.uniqueArray(cartLineItemArb, {
                        minLength: 0,
                        maxLength: 10,
                        selector: (item) => item.variantId,
                    }),
                    (items) => {
                        useCartStore.setState({items: [], itemCount: 0})

                        // Add all items
                        for (const item of items) {
                            useCartStore.getState().addItem(item)
                        }

                        const state = useCartStore.getState()
                        const expectedCount = state.items.reduce(
                            (sum, i) => sum + i.quantity,
                            0
                        )

                        expect(state.itemCount).toBe(expectedCount)
                    }
                ),
                {numRuns: 100}
            )
        })

        it('when the cart is empty, itemCount equals 0', () => {
            useCartStore.setState({items: [], itemCount: 0})
            expect(useCartStore.getState().itemCount).toBe(0)
        })

        it('itemCount stays correct after a sequence of add and updateQty operations', () => {
            fc.assert(
                fc.property(
                    fc.uniqueArray(cartLineItemArb, {
                        minLength: 1,
                        maxLength: 5,
                        selector: (item) => item.variantId,
                    }),
                    fc.nat().map((n) => n + 1), // new positive quantity for update
                    (items, newQty) => {
                        useCartStore.setState({items: [], itemCount: 0})

                        // Add all items
                        for (const item of items) {
                            useCartStore.getState().addItem(item)
                        }

                        // Update first item's quantity to newQty
                        useCartStore.getState().updateQty(items[0].variantId, newQty)

                        const state = useCartStore.getState()
                        const expectedCount = state.items.reduce(
                            (sum, i) => sum + i.quantity,
                            0
                        )

                        expect(state.itemCount).toBe(expectedCount)
                    }
                ),
                {numRuns: 100}
            )
        })
    })
})

// Feature: cart-store, Property 4: Cart persistence round-trip

/**
 * In-memory Storage implementation for testing localStorage persistence.
 */
function createInMemoryStorage(): Storage {
    const store = new Map<string, string>()
    return {
        getItem: (key: string) => store.get(key) ?? null,
        setItem: (key: string, value: string) => {
            store.set(key, value)
        },
        removeItem: (key: string) => {
            store.delete(key)
        },
        clear: () => {
            store.clear()
        },
        get length() {
            return store.size
        },
        key: (index: number) => [...store.keys()][index] ?? null,
    }
}

/**
 * Creates a fresh cart store instance backed by the given storage.
 * Mirrors the production cartStore implementation exactly.
 */
function createCartStoreWithStorage(storage: Storage) {
    const computeItemCount = (items: CartLineItem[]): number =>
        items.reduce((sum, item) => sum + item.quantity, 0)

    return create<CartState>()(
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
                clearCart: () => set({items: [], itemCount: 0}),
            }),
            {
                name: 'ec_cart_items',
                storage: createJSONStorage(() => storage),
            }
        )
    )
}

// Mutation command types for Property 4
type CartMutation =
    | { type: 'add'; item: CartLineItem }
    | { type: 'updateQty'; variantId: string; quantity: number }
    | { type: 'remove'; variantId: string }
    | { type: 'clearCart' }

// Generator for a mutation sequence
const cartMutationArb: fc.Arbitrary<CartMutation> = fc.oneof(
    cartLineItemArb.map((item) => ({type: 'add' as const, item})),
    fc.record({
        type: fc.constant('updateQty' as const),
        variantId: fc.string({minLength: 1, maxLength: 20}).filter((s) => s.trim().length > 0),
        quantity: fc.integer({min: -5, max: 100}),
    }),
    fc.record({
        type: fc.constant('remove' as const),
        variantId: fc.string({minLength: 1, maxLength: 20}).filter((s) => s.trim().length > 0),
    }),
    fc.constant({type: 'clearCart' as const}),
)

const mutationSequenceArb = fc.array(cartMutationArb, {minLength: 1, maxLength: 15})

function applyMutation(store: ReturnType<typeof createCartStoreWithStorage>, mutation: CartMutation) {
    switch (mutation.type) {
        case 'add':
            store.getState().addItem(mutation.item)
            break
        case 'updateQty':
            store.getState().updateQty(mutation.variantId, mutation.quantity)
            break
        case 'remove':
            store.getState().remove(mutation.variantId)
            break
        case 'clearCart':
            store.getState().clearCart()
            break
    }
}

describe('cartStore — Property 4: Cart persistence round-trip', () => {
    // **Validates: Requirements 1.4, 1.5, 1.6**

    it('localStorage value matches in-memory state after any mutation sequence', () => {
        fc.assert(
            fc.property(mutationSequenceArb, (mutations) => {
                const storage = createInMemoryStorage()
                const store = createCartStoreWithStorage(storage)

                // Apply all mutations
                for (const mutation of mutations) {
                    applyMutation(store, mutation)
                }

                // Read the persisted state from storage
                const raw = storage.getItem('ec_cart_items')
                expect(raw).not.toBeNull()

                const persisted = JSON.parse(raw!)
                const persistedItems: CartLineItem[] = persisted.state.items
                const persistedItemCount: number = persisted.state.itemCount

                // Compare with in-memory state
                const inMemoryState = store.getState()
                expect(persistedItems).toEqual(inMemoryState.items)
                expect(persistedItemCount).toEqual(inMemoryState.itemCount)
            }),
            {numRuns: 100}
        )
    })

    it('initializing a new store from persisted localStorage produces the same items and itemCount', () => {
        fc.assert(
            fc.property(mutationSequenceArb, (mutations) => {
                const storage = createInMemoryStorage()
                const store = createCartStoreWithStorage(storage)

                // Apply all mutations to populate the store and localStorage
                for (const mutation of mutations) {
                    applyMutation(store, mutation)
                }

                const originalItems = store.getState().items
                const originalItemCount = store.getState().itemCount

                // Create a new store instance from the same storage (simulates page refresh)
                const rehydratedStore = createCartStoreWithStorage(storage)

                // Zustand persist rehydrates synchronously when using synchronous storage
                const rehydratedState = rehydratedStore.getState()

                expect(rehydratedState.items).toEqual(originalItems)
                expect(rehydratedState.itemCount).toEqual(originalItemCount)
            }),
            {numRuns: 100}
        )
    })

    it('clearCart results in empty items in both storage and memory', () => {
        fc.assert(
            fc.property(
                fc.array(cartLineItemArb, {minLength: 1, maxLength: 10}),
                (items) => {
                    const storage = createInMemoryStorage()
                    const store = createCartStoreWithStorage(storage)

                    // Add items then clear
                    for (const item of items) {
                        store.getState().addItem(item)
                    }
                    store.getState().clearCart()

                    // In-memory state should be empty
                    expect(store.getState().items).toEqual([])
                    expect(store.getState().itemCount).toEqual(0)

                    // Persisted state should also be empty
                    const raw = storage.getItem('ec_cart_items')
                    expect(raw).not.toBeNull()
                    const persisted = JSON.parse(raw!)
                    expect(persisted.state.items).toEqual([])
                    expect(persisted.state.itemCount).toEqual(0)
                }
            ),
            {numRuns: 100}
        )
    })
})
