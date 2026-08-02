import { describe, it, expect } from 'vitest'
import { toWishlistCardProduct } from './wishlistCardAdapter'
import type { HydratedWishlistItem } from './useWishlistHydration'

function makeItem(overrides: Partial<HydratedWishlistItem> = {}): HydratedWishlistItem {
  return {
    variantId: 'v-1',
    variantLabel: '{"Size":"L"}',
    sku: 'SKU-001',
    productId: 'p-1',
    productName: 'Test Product',
    productSlug: 'test-product',
    imagePath: '/images/product.jpg',
    retailPrice: { price: 100 },
    wholesalePrice: { price: 80 },
    retailSalePrice: { price: 90, active: true },
    wholesaleSalePrice: { price: 70, active: true },
    inStock: true,
    productActive: true,
    ...overrides,
  }
}

describe('toWishlistCardProduct', () => {
  describe('image wrapping', () => {
    it('wraps an imagePath into a single-element images array with featured and sortOrder', () => {
      const result = toWishlistCardProduct(makeItem({ imagePath: '/images/shoe.jpg' }))

      expect(result.images).toEqual([
        { imageUrl: '/images/shoe.jpg', featured: true, sortOrder: 0 },
      ])
    })

    it('returns an empty images array when imagePath is null', () => {
      const result = toWishlistCardProduct(makeItem({ imagePath: null }))

      expect(result.images).toEqual([])
    })
  })

  describe('sale tier gating on active', () => {
    it('passes through retailSalePrice when active is true', () => {
      const result = toWishlistCardProduct(
        makeItem({ retailSalePrice: { price: 85, active: true } }),
      )

      expect(result.retailSalePrice).toEqual({ price: 85, active: true })
    })

    it('passes through wholesaleSalePrice when active is true', () => {
      const result = toWishlistCardProduct(
        makeItem({ wholesaleSalePrice: { price: 60, active: true } }),
      )

      expect(result.wholesaleSalePrice).toEqual({ price: 60, active: true })
    })

    it('returns null for retailSalePrice when active is false', () => {
      const result = toWishlistCardProduct(
        makeItem({ retailSalePrice: { price: 85, active: false } }),
      )

      expect(result.retailSalePrice).toBeNull()
    })

    it('returns null for wholesaleSalePrice when active is false', () => {
      const result = toWishlistCardProduct(
        makeItem({ wholesaleSalePrice: { price: 60, active: false } }),
      )

      expect(result.wholesaleSalePrice).toBeNull()
    })
  })

  describe('null price tiers', () => {
    it('returns null when retailSalePrice is null', () => {
      const result = toWishlistCardProduct(makeItem({ retailSalePrice: null }))

      expect(result.retailSalePrice).toBeNull()
    })

    it('returns null when wholesaleSalePrice is null', () => {
      const result = toWishlistCardProduct(makeItem({ wholesaleSalePrice: null }))

      expect(result.wholesaleSalePrice).toBeNull()
    })

    it('passes through null retailPrice', () => {
      const result = toWishlistCardProduct(makeItem({ retailPrice: null }))

      expect(result.retailPrice).toBeNull()
    })

    it('passes through null wholesalePrice', () => {
      const result = toWishlistCardProduct(makeItem({ wholesalePrice: null }))

      expect(result.wholesalePrice).toBeNull()
    })
  })

  describe('inStock passthrough', () => {
    it('passes through inStock: true', () => {
      const result = toWishlistCardProduct(makeItem({ inStock: true }))

      expect(result.inStock).toBe(true)
    })

    it('passes through inStock: false', () => {
      const result = toWishlistCardProduct(makeItem({ inStock: false }))

      expect(result.inStock).toBe(false)
    })

    it('defaults inStock to null when absent (null on the item)', () => {
      const result = toWishlistCardProduct(makeItem({ inStock: null }))

      expect(result.inStock).toBeNull()
    })
  })

  describe('identity passthrough', () => {
    it('maps productId to id, productName to name, productSlug to slug', () => {
      const result = toWishlistCardProduct(
        makeItem({ productId: 'abc', productName: 'Widget', productSlug: 'widget' }),
      )

      expect(result.id).toBe('abc')
      expect(result.name).toBe('Widget')
      expect(result.slug).toBe('widget')
    })

    it('passes sku through', () => {
      const result = toWishlistCardProduct(makeItem({ sku: 'MY-SKU-42' }))

      expect(result.sku).toBe('MY-SKU-42')
    })
  })
})
