import {type CartLineItem, useCartStore} from '../store/cartStore'
import {beforeEach, describe, expect, it} from 'vitest'

const resetStore = () => {
    useCartStore.setState({items: [], itemCount: 0})
}

const makeItem = (overrides: Partial<CartLineItem> = {}): CartLineItem => ({
    variantId: 'variant-1',
    productName: 'Test Product',
    variantLabel: 'Red / Large',
    quantity: 1,
    ...overrides,
})

describe('cartStore', () => {
    beforeEach(() => {
        resetStore()
    })

    describe('addItem', () => {
        it('adds the first item to an empty cart', () => {
            const item = makeItem()
            useCartStore.getState().addItem(item)

            const {items, itemCount} = useCartStore.getState()
            expect(items).toHaveLength(1)
            expect(items[0]).toEqual(item)
            expect(itemCount).toBe(1)
        })

        it('merges quantity when adding the same variantId', () => {
            const item1 = makeItem({quantity: 2})
            const item2 = makeItem({quantity: 3})

            useCartStore.getState().addItem(item1)
            useCartStore.getState().addItem(item2)

            const {items, itemCount} = useCartStore.getState()
            expect(items).toHaveLength(1)
            expect(items[0].variantId).toBe('variant-1')
            expect(items[0].quantity).toBe(5)
            expect(itemCount).toBe(5)
        })

        it('appends a different variant without merging', () => {
            const item1 = makeItem({variantId: 'variant-1', quantity: 2})
            const item2 = makeItem({variantId: 'variant-2', productName: 'Other Product', quantity: 1})

            useCartStore.getState().addItem(item1)
            useCartStore.getState().addItem(item2)

            const {items, itemCount} = useCartStore.getState()
            expect(items).toHaveLength(2)
            expect(itemCount).toBe(3)
        })
    })

    describe('updateQty', () => {
        it('updates the quantity of an existing item', () => {
            useCartStore.getState().addItem(makeItem({quantity: 1}))
            useCartStore.getState().updateQty('variant-1', 5)

            const {items, itemCount} = useCartStore.getState()
            expect(items[0].quantity).toBe(5)
            expect(itemCount).toBe(5)
        })

        it('removes the item when quantity is set to 0', () => {
            useCartStore.getState().addItem(makeItem({quantity: 3}))
            useCartStore.getState().updateQty('variant-1', 0)

            const {items, itemCount} = useCartStore.getState()
            expect(items).toHaveLength(0)
            expect(itemCount).toBe(0)
        })

        it('removes the item when quantity is set to a negative number', () => {
            useCartStore.getState().addItem(makeItem({quantity: 2}))
            useCartStore.getState().updateQty('variant-1', -1)

            const {items, itemCount} = useCartStore.getState()
            expect(items).toHaveLength(0)
            expect(itemCount).toBe(0)
        })
    })

    describe('remove', () => {
        it('removes an item by variantId', () => {
            useCartStore.getState().addItem(makeItem({variantId: 'variant-1'}))
            useCartStore.getState().addItem(makeItem({variantId: 'variant-2', productName: 'Other'}))
            useCartStore.getState().remove('variant-1')

            const {items, itemCount} = useCartStore.getState()
            expect(items).toHaveLength(1)
            expect(items[0].variantId).toBe('variant-2')
            expect(itemCount).toBe(1)
        })

        it('removes the last item leaving an empty cart', () => {
            useCartStore.getState().addItem(makeItem())
            useCartStore.getState().remove('variant-1')

            const {items, itemCount} = useCartStore.getState()
            expect(items).toHaveLength(0)
            expect(itemCount).toBe(0)
        })
    })

    describe('clear', () => {
        it('clears all items from the cart', () => {
            useCartStore.getState().addItem(makeItem({variantId: 'variant-1'}))
            useCartStore.getState().addItem(makeItem({variantId: 'variant-2', productName: 'Other'}))
            useCartStore.getState().clear()

            const {items, itemCount} = useCartStore.getState()
            expect(items).toHaveLength(0)
            expect(itemCount).toBe(0)
        })

        it('does not throw when clearing an already empty cart', () => {
            expect(() => useCartStore.getState().clear()).not.toThrow()

            const {items, itemCount} = useCartStore.getState()
            expect(items).toHaveLength(0)
            expect(itemCount).toBe(0)
        })
    })
})
