import {describe, expect, it} from 'vitest'
import {getDisplayPrice} from '../pricing'

describe('getDisplayPrice', () => {
    const variant = {
        retailPrice: 100,
        wholesalePrice: 70,
        retailSalePrice: 80,
        wholesaleSalePrice: 55,
    }

    describe('retail customer', () => {
        it('returns sale price as price and base as originalPrice when sale is active', () => {
            const result = getDisplayPrice(variant, 'RETAIL')

            expect(result).toEqual({price: 80, originalPrice: 100})
        })

        it('returns base price as price and null originalPrice when no sale is active', () => {
            const noSaleVariant = {
                retailPrice: 100,
                wholesalePrice: 70,
                retailSalePrice: null,
                wholesaleSalePrice: 55,
            }

            const result = getDisplayPrice(noSaleVariant, 'RETAIL')

            expect(result).toEqual({price: 100, originalPrice: null})
        })
    })

    describe('wholesale customer', () => {
        it('returns wholesale sale price as price and wholesale base as originalPrice when sale is active', () => {
            const result = getDisplayPrice(variant, 'WHOLESALE')

            expect(result).toEqual({price: 55, originalPrice: 70})
        })

        it('returns wholesale base price as price and null originalPrice when no sale is active', () => {
            const noWholesaleSaleVariant = {
                retailPrice: 100,
                wholesalePrice: 70,
                retailSalePrice: 80,
                wholesaleSalePrice: null,
            }

            const result = getDisplayPrice(noWholesaleSaleVariant, 'WHOLESALE')

            expect(result).toEqual({price: 70, originalPrice: null})
        })
    })

    describe('null/unauthenticated customerType', () => {
        it('falls back to retail tier when customerType is null', () => {
            const result = getDisplayPrice(variant, null)

            expect(result).toEqual({price: 80, originalPrice: 100})
        })

        it('falls back to retail base price when customerType is null and no sale is active', () => {
            const noSaleVariant = {
                retailPrice: 100,
                wholesalePrice: 70,
                retailSalePrice: null,
                wholesaleSalePrice: null,
            }

            const result = getDisplayPrice(noSaleVariant, null)

            expect(result).toEqual({price: 100, originalPrice: null})
        })
    })
})
