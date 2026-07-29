import { type QuoteLineItem, useQuoteStore } from '../quoteStore'
import { beforeEach, describe, expect, it } from 'vitest'

const resetStore = () => {
  useQuoteStore.setState({ items: [], itemCount: 0 })
}

const makeItem = (overrides: Partial<QuoteLineItem> = {}): QuoteLineItem => ({
  variantId: 'variant-1',
  productName: 'Test Product',
  variantLabel: 'Red / Large',
  quantity: 1,
  ...overrides,
})

describe('quoteStore', () => {
  beforeEach(() => {
    resetStore()
  })

  describe('persistence key', () => {
    it('uses ec_quote_items as the persist key', () => {
      // The persist middleware stores state under this key in localStorage
      expect(useQuoteStore.persist.getOptions().name).toBe('ec_quote_items')
    })
  })

  describe('addItem', () => {
    it('adds a new item to an empty quote list', () => {
      const item = makeItem()
      useQuoteStore.getState().addItem(item)

      const { items, itemCount } = useQuoteStore.getState()
      expect(items).toHaveLength(1)
      expect(items[0]).toEqual(item)
      expect(itemCount).toBe(1)
    })

    it('increments quantity when adding a duplicate variantId', () => {
      const item1 = makeItem({ quantity: 2 })
      const item2 = makeItem({ quantity: 3 })

      useQuoteStore.getState().addItem(item1)
      useQuoteStore.getState().addItem(item2)

      const { items, itemCount } = useQuoteStore.getState()
      expect(items).toHaveLength(1)
      expect(items[0].variantId).toBe('variant-1')
      expect(items[0].quantity).toBe(5)
      expect(itemCount).toBe(5)
    })

    it('appends a different variant without merging', () => {
      const item1 = makeItem({ variantId: 'variant-1', quantity: 2 })
      const item2 = makeItem({ variantId: 'variant-2', productName: 'Other Product', quantity: 1 })

      useQuoteStore.getState().addItem(item1)
      useQuoteStore.getState().addItem(item2)

      const { items, itemCount } = useQuoteStore.getState()
      expect(items).toHaveLength(2)
      expect(itemCount).toBe(3)
    })
  })

  describe('updateQty', () => {
    it('sets the quantity of an existing item', () => {
      useQuoteStore.getState().addItem(makeItem({ quantity: 1 }))
      useQuoteStore.getState().updateQty('variant-1', 5)

      const { items, itemCount } = useQuoteStore.getState()
      expect(items[0].quantity).toBe(5)
      expect(itemCount).toBe(5)
    })

    it('removes the item when quantity is set to 0', () => {
      useQuoteStore.getState().addItem(makeItem({ quantity: 3 }))
      useQuoteStore.getState().updateQty('variant-1', 0)

      const { items, itemCount } = useQuoteStore.getState()
      expect(items).toHaveLength(0)
      expect(itemCount).toBe(0)
    })

    it('removes the item when quantity is set to a negative number', () => {
      useQuoteStore.getState().addItem(makeItem({ quantity: 2 }))
      useQuoteStore.getState().updateQty('variant-1', -1)

      const { items, itemCount } = useQuoteStore.getState()
      expect(items).toHaveLength(0)
      expect(itemCount).toBe(0)
    })
  })

  describe('remove', () => {
    it('removes an item by variantId', () => {
      useQuoteStore.getState().addItem(makeItem({ variantId: 'variant-1' }))
      useQuoteStore.getState().addItem(makeItem({ variantId: 'variant-2', productName: 'Other' }))
      useQuoteStore.getState().remove('variant-1')

      const { items, itemCount } = useQuoteStore.getState()
      expect(items).toHaveLength(1)
      expect(items[0].variantId).toBe('variant-2')
      expect(itemCount).toBe(1)
    })

    it('removes the last item leaving an empty list', () => {
      useQuoteStore.getState().addItem(makeItem())
      useQuoteStore.getState().remove('variant-1')

      const { items, itemCount } = useQuoteStore.getState()
      expect(items).toHaveLength(0)
      expect(itemCount).toBe(0)
    })
  })

  describe('clear', () => {
    it('clears all items from the quote list', () => {
      useQuoteStore.getState().addItem(makeItem({ variantId: 'variant-1' }))
      useQuoteStore.getState().addItem(makeItem({ variantId: 'variant-2', productName: 'Other' }))
      useQuoteStore.getState().clear()

      const { items, itemCount } = useQuoteStore.getState()
      expect(items).toHaveLength(0)
      expect(itemCount).toBe(0)
    })

    it('does not throw when clearing an already empty list', () => {
      expect(() => useQuoteStore.getState().clear()).not.toThrow()

      const { items, itemCount } = useQuoteStore.getState()
      expect(items).toHaveLength(0)
      expect(itemCount).toBe(0)
    })
  })
})
