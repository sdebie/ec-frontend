import {describe, expect, it} from 'vitest'
import fc from 'fast-check'
import {mapShopperType} from '../mapShopperType'

describe('mapShopperType', () => {
    describe('unit tests', () => {
        it('maps WHOLESALER to WHOLESALE', () => {
            expect(mapShopperType('WHOLESALER')).toBe('WHOLESALE')
        })

        it('maps RETAILER to RETAIL', () => {
            expect(mapShopperType('RETAILER')).toBe('RETAIL')
        })

        it('maps GUEST to GUEST', () => {
            expect(mapShopperType('GUEST')).toBe('GUEST')
        })

        it('maps null to GUEST', () => {
            expect(mapShopperType(null)).toBe('GUEST')
        })

        it('maps undefined to GUEST', () => {
            expect(mapShopperType(undefined)).toBe('GUEST')
        })

        it('maps unrecognised string to GUEST', () => {
            expect(mapShopperType('UNKNOWN')).toBe('GUEST')
            expect(mapShopperType('')).toBe('GUEST')
            expect(mapShopperType('wholesaler')).toBe('GUEST')
            expect(mapShopperType('retailer')).toBe('GUEST')
        })
    })

    describe('property-based tests', () => {
        /**
         * Property 1: mapShopperType always returns one of 'WHOLESALE', 'RETAIL', or 'GUEST'
         * for any input.
         */
        it('always returns a valid CustomerType for any string input', () => {
            const validTypes = ['WHOLESALE', 'RETAIL', 'GUEST'] as const

            fc.assert(
                fc.property(fc.string(), (input) => {
                    const result = mapShopperType(input)
                    expect(validTypes).toContain(result)
                }),
                {numRuns: 100},
            )
        })

        it('always returns a valid CustomerType for null and undefined', () => {
            const validTypes = ['WHOLESALE', 'RETAIL', 'GUEST'] as const

            const result1 = mapShopperType(null)
            expect(validTypes).toContain(result1)

            const result2 = mapShopperType(undefined)
            expect(validTypes).toContain(result2)
        })

        /**
         * Property 2: Any string that is NOT 'WHOLESALER' or 'RETAILER'
         * (including null, undefined, empty string) returns 'GUEST'.
         */
        it('returns GUEST for any string that is not WHOLESALER or RETAILER', () => {
            const nonMappedStrings = fc.string().filter(
                (s) => s !== 'WHOLESALER' && s !== 'RETAILER',
            )

            fc.assert(
                fc.property(nonMappedStrings, (input) => {
                    expect(mapShopperType(input)).toBe('GUEST')
                }),
                {numRuns: 100},
            )
        })

        it('returns GUEST for null and undefined inputs', () => {
            expect(mapShopperType(null)).toBe('GUEST')
            expect(mapShopperType(undefined)).toBe('GUEST')
        })
    })
})
