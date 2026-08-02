import {describe, expect, it} from 'vitest'
import {estimateSubtotal, toCartRows} from '../mappers'
import type {CartLineItem} from '../store/cartStore.ts'
import type {CartVariant} from '../hooks/useCartVariants'

function line(overrides: Partial<CartLineItem> = {}): CartLineItem {
    return {
        variantId: 'v1',
        productName: 'Classic Tee',
        variantLabel: 'Red / M',
        quantity: 2,
        ...overrides,
    }
}

function variant(overrides: Partial<CartVariant> = {}): CartVariant {
    return {
        id: 'v1',
        sku: 'TEE-1',
        status: 'ACTIVE',
        stockQuantity: 10,
        displayPrice: 100,
        images: [],
        ...overrides,
    }
}

function build(
    items: CartLineItem[],
    variants: CartVariant[],
    unavailableIds: string[] = [],
    checkoutFlaggedIds: string[] = [],
) {
    return toCartRows({
        items,
        variants: new Map(variants.map((v) => [v.id, v])),
        unavailableIds,
        checkoutFlaggedIds,
    })
}

describe('toCartRows', () => {
    it('multiplies the backend-selected unit price by the quantity', () => {
        const [row] = build([line({quantity: 3})], [variant({displayPrice: 19.99})])

        expect(row.unitPrice).toBe(19.99)
        expect(row.lineTotal).toBe(19.99 * 3)
        expect(row.isOrderable).toBe(true)
    })

    it('resolves the featured image through the shared pipeline', () => {
        const [row] = build(
            [line()],
            [
                variant({
                    images: [
                        {imageUrl: 'images/01/other.png', featured: false, sortOrder: 1},
                        {imageUrl: 'images/01/hero.png', featured: true, sortOrder: 2},
                    ],
                }),
            ],
        )

        expect(row.imageUrl).toBe('/static/images/images/01/hero.png')
    })

    it('parses a legacy raw-JSON variant label and leaves a display label untouched', () => {
        const [json] = build([line({variantLabel: '{"Size":"L","Colour":"Red"}'})], [variant()])
        const [display] = build([line({variantLabel: 'Red / M'})], [variant()])

        expect(json.variantLabel).toBe('Size: L, Colour: Red')
        expect(display.variantLabel).toBe('Red / M')
    })

    describe('availability', () => {
        it('marks a variant the catalogue did not return as unavailable', () => {
            const [row] = build([line()], [], ['v1'])

            expect(row.isUnavailable).toBe(true)
            expect(row.isOrderable).toBe(false)
        })

        it('marks a non-ACTIVE variant as unavailable', () => {
            const [row] = build([line()], [variant({status: 'DISABLED'})])

            expect(row.isUnavailable).toBe(true)
            expect(row.isOrderable).toBe(false)
        })

        it('treats an unknown status as unknown, not disabled', () => {
            const [row] = build([line()], [variant({status: null})])

            expect(row.isUnavailable).toBe(false)
            expect(row.isOrderable).toBe(true)
        })

        it('blocks a checkout-flagged line without calling it unavailable', () => {
            const [row] = build([line()], [variant()], [], ['v1'])

            expect(row.isCheckoutFlagged).toBe(true)
            expect(row.isUnavailable).toBe(false)
            expect(row.isOrderable).toBe(false)
        })

        it('blocks a line with zero stock', () => {
            const [row] = build([line()], [variant({stockQuantity: 0})])

            expect(row.isOutOfStock).toBe(true)
            expect(row.isOrderable).toBe(false)
        })

        it('blocks a quantity above the known stock, mirroring the server rule', () => {
            const [row] = build([line({quantity: 5})], [variant({stockQuantity: 4})])

            expect(row.exceedsStock).toBe(true)
            expect(row.isOrderable).toBe(false)
        })

        it('allows a quantity equal to the known stock', () => {
            const [row] = build([line({quantity: 4})], [variant({stockQuantity: 4})])

            expect(row.exceedsStock).toBe(false)
            expect(row.isOrderable).toBe(true)
        })

        it('never blocks on unknown stock — unknown is not "none left"', () => {
            const [row] = build([line({quantity: 99})], [variant({stockQuantity: null})])

            expect(row.isOutOfStock).toBe(false)
            expect(row.exceedsStock).toBe(false)
            expect(row.isOrderable).toBe(true)
        })

        it('blocks a line with no price rather than letting it order at zero', () => {
            const [row] = build([line()], [variant({displayPrice: null})])

            expect(row.lineTotal).toBeNull()
            expect(row.isOrderable).toBe(false)
        })
    })
})

describe('estimateSubtotal', () => {
    it('sums only the orderable lines', () => {
        const rows = build(
            [
                line({variantId: 'v1', quantity: 2}),
                line({variantId: 'v2', quantity: 1}),
                line({variantId: 'v3', quantity: 1}),
            ],
            [
                variant({id: 'v1', displayPrice: 100}),
                variant({id: 'v2', displayPrice: 50, stockQuantity: 0}),
                variant({id: 'v3', displayPrice: 25}),
            ],
        )

        expect(estimateSubtotal(rows)).toBe(225)
    })

    it('is zero for an empty cart', () => {
        expect(estimateSubtotal([])).toBe(0)
    })
})
