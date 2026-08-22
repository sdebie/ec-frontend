// Feature: checkout, Property 1: Session store round-trip
import {beforeEach, describe, expect, it} from 'vitest'
import * as fc from 'fast-check'
import {useCheckoutSessionStore} from '../store/checkoutSessionStore'
import type {CheckoutSession} from '../types'

// Arbitrary for OrderCheckoutLine
const orderCheckoutLineArb = fc.record({
    variantId: fc.string({minLength: 1}),
    name: fc.string({minLength: 1}),
    unitPrice: fc.float({min: 0, noNaN: true}),
    quantity: fc.integer({min: 1}),
    lineTotal: fc.float({min: 0, noNaN: true}),
})

const checkoutSessionArb: fc.Arbitrary<CheckoutSession> = fc.record({
    orderId: fc.uuid(),
    sessionId: fc.uuid(),
    lines: fc.array(orderCheckoutLineArb, {minLength: 1, maxLength: 10}),
    subtotal: fc.float({min: 0, noNaN: true}),
    vatAmount: fc.float({min: 0, noNaN: true}),
    shippingEstimate: fc.float({min: 0, noNaN: true}),
    grandTotal: fc.float({min: 0, noNaN: true}),
    orderToken: fc.string({minLength: 1}),
})

describe('checkoutSessionStore - Property Tests', () => {
    beforeEach(() => {
        useCheckoutSessionStore.setState({session: null})
    })

    it('Property 1: setSession followed by getState().session produces deeply equal output', () => {
        fc.assert(
            fc.property(checkoutSessionArb, (session) => {
                useCheckoutSessionStore.getState().setSession(session)
                const stored = useCheckoutSessionStore.getState().session

                expect(stored).toEqual(session)
            }),
            {numRuns: 100}
        )
    })
})

describe('checkoutSessionStore — clearCheckoutIntent / clearOrder split (guest-order-authorization)', () => {
    beforeEach(() => {
        useCheckoutSessionStore.setState({session: null, idempotencyKey: null, idempotencyKeyCartSignature: null})
    })

    it('clearCheckoutIntent() clears the idempotency key but keeps the session (orderId/orderToken survive a refresh)', () => {
        fc.assert(
            fc.property(checkoutSessionArb, (session) => {
                useCheckoutSessionStore.getState().setSession(session)
                useCheckoutSessionStore.setState({idempotencyKey: 'some-key', idempotencyKeyCartSignature: 'sig'})

                useCheckoutSessionStore.getState().clearCheckoutIntent()

                const state = useCheckoutSessionStore.getState()
                expect(state.session).toEqual(session)
                expect(state.idempotencyKey).toBeNull()
                expect(state.idempotencyKeyCartSignature).toBeNull()
            }),
            {numRuns: 20}
        )
    })

    it('clearOrder() clears everything, including the session', () => {
        fc.assert(
            fc.property(checkoutSessionArb, (session) => {
                useCheckoutSessionStore.getState().setSession(session)
                useCheckoutSessionStore.setState({idempotencyKey: 'some-key', idempotencyKeyCartSignature: 'sig'})

                useCheckoutSessionStore.getState().clearOrder()

                const state = useCheckoutSessionStore.getState()
                expect(state.session).toBeNull()
                expect(state.idempotencyKey).toBeNull()
                expect(state.idempotencyKeyCartSignature).toBeNull()
            }),
            {numRuns: 20}
        )
    })
})
