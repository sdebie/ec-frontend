import {describe, expect, it} from 'vitest'

import {availablePaymentMethods, IN_STORE_PAYMENT_METHOD} from '../availablePaymentMethods'

/**
 * The server refuses the same combination when the order is confirmed, so a
 * shopper who got this far would be stopped anyway — this is about not offering
 * a choice that cannot work, not about making it impossible.
 */
describe('availablePaymentMethods', () => {
    it('offers everything when the shopper is collecting', () => {
        expect(availablePaymentMethods(['PAYFAST', IN_STORE_PAYMENT_METHOD], false)).toEqual([
            'PAYFAST',
            IN_STORE_PAYMENT_METHOD,
        ])
    })

    it('withdraws pay-in-store when the order needs an address', () => {
        expect(availablePaymentMethods(['PAYFAST', IN_STORE_PAYMENT_METHOD], true)).toEqual(['PAYFAST'])
    })

    it('leaves other methods alone', () => {
        expect(availablePaymentMethods(['PAYFAST'], true)).toEqual(['PAYFAST'])
        expect(availablePaymentMethods([], true)).toEqual([])
    })

    /**
     * A store that only takes payment at the counter has nothing left to offer for
     * a delivery. Returning an empty list rather than falling back to the full one
     * is what lets the page disable the submit button instead of promising a
     * payment route that does not exist.
     */
    it('returns nothing when in-store is the only method and the order is delivered', () => {
        expect(availablePaymentMethods([IN_STORE_PAYMENT_METHOD], true)).toEqual([])
    })
})
