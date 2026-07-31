import {describe, expect, it} from 'vitest'
import {getDisplayPrice, priceBasisFor} from '../pricing'
import type {CustomerType} from '@/shared/auth/customerAuthStore'

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


describe('priceBasisFor', () => {
    it('returns RETAIL for null', () => {
        expect(priceBasisFor(null)).toBe('RETAIL')
    })

    it('returns RETAIL for GUEST', () => {
        expect(priceBasisFor('GUEST')).toBe('RETAIL')
    })

    it('returns RETAIL for RETAIL', () => {
        expect(priceBasisFor('RETAIL')).toBe('RETAIL')
    })

    it('returns WHOLESALE for WHOLESALE', () => {
        expect(priceBasisFor('WHOLESALE')).toBe('WHOLESALE')
    })
})

describe('priceBasisFor agrees with getDisplayPrice', () => {
    // The invariant: the tier priceBasisFor names is the tier getDisplayPrice
    // actually uses as the primary price. This is the only guard on an
    // invariant the server does not enforce.
    const variant = {
        retailPrice: 100,
        wholesalePrice: 70,
        retailSalePrice: 80,
        wholesaleSalePrice: 55,
    }

    const customerTypes: Array<CustomerType | null> = [null, 'GUEST', 'RETAIL', 'WHOLESALE']

    customerTypes.forEach((customerType) => {
        it(`priceBasisFor('${customerType}') agrees with getDisplayPrice for that type`, () => {
            const basis = priceBasisFor(customerType)
            const displayPrice = getDisplayPrice(variant, customerType)

            if (basis === 'RETAIL') {
                // getDisplayPrice should use retailSalePrice (if exists) or retailPrice
                const expectedPrice = variant.retailSalePrice ?? variant.retailPrice
                expect(displayPrice.price).toBe(expectedPrice)
            } else {
                // WHOLESALE: getDisplayPrice should use wholesaleSalePrice (if exists) or wholesalePrice
                const expectedPrice = variant.wholesaleSalePrice ?? variant.wholesalePrice
                expect(displayPrice.price).toBe(expectedPrice)
            }
        })
    })

    it('RETAIL basis — getDisplayPrice picks sale over base when sale exists', () => {
        const withSale = {
            retailPrice: 200,
            wholesalePrice: 150,
            retailSalePrice: 180,
            wholesaleSalePrice: null,
        }
        expect(priceBasisFor('RETAIL')).toBe('RETAIL')
        const result = getDisplayPrice(withSale, 'RETAIL')
        expect(result.price).toBe(180) // retailSalePrice
        expect(result.originalPrice).toBe(200) // retailPrice
    })

    it('RETAIL basis — getDisplayPrice picks base when no sale exists', () => {
        const noSale = {
            retailPrice: 200,
            wholesalePrice: 150,
            retailSalePrice: null,
            wholesaleSalePrice: null,
        }
        expect(priceBasisFor('RETAIL')).toBe('RETAIL')
        const result = getDisplayPrice(noSale, 'RETAIL')
        expect(result.price).toBe(200) // retailPrice
        expect(result.originalPrice).toBeNull()
    })

    it('WHOLESALE basis — getDisplayPrice picks sale over base when sale exists', () => {
        const withSale = {
            retailPrice: 200,
            wholesalePrice: 150,
            retailSalePrice: null,
            wholesaleSalePrice: 120,
        }
        expect(priceBasisFor('WHOLESALE')).toBe('WHOLESALE')
        const result = getDisplayPrice(withSale, 'WHOLESALE')
        expect(result.price).toBe(120) // wholesaleSalePrice
        expect(result.originalPrice).toBe(150) // wholesalePrice
    })

    it('WHOLESALE basis — getDisplayPrice picks base when no sale exists', () => {
        const noSale = {
            retailPrice: 200,
            wholesalePrice: 150,
            retailSalePrice: null,
            wholesaleSalePrice: null,
        }
        expect(priceBasisFor('WHOLESALE')).toBe('WHOLESALE')
        const result = getDisplayPrice(noSale, 'WHOLESALE')
        expect(result.price).toBe(150) // wholesalePrice
        expect(result.originalPrice).toBeNull()
    })
})
