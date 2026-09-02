// Feature: checkout, Property 4: the method states whether an address is needed
import {describe, expect, it} from 'vitest'
import * as fc from 'fast-check'
import {requiresDeliveryAddress} from '../utils/requiresDeliveryAddress'
import type {ShippingMethod} from '../types'

/**
 * Fee and lead time are deliberately random and independent of `requiresAddress`
 * here — deriving the decision from them (e.g. `baseFee > 0 || estimatedDays !==
 * '0'`) misclassifies a free, same-day In-Store Pickup as a delivery, demanding
 * an address the customer does not have and blocking the order. This property
 * pins the inverse: those two fields must not influence the decision.
 */
const methodArb = (requiresAddress: boolean): fc.Arbitrary<ShippingMethod> =>
    fc.record({
        id: fc.uuid(),
        name: fc.string({minLength: 1}),
        baseFee: fc.float({min: 0, max: 1000, noNaN: true}),
        estimatedDays: fc.oneof(
            fc.constant(null),
            fc.constant('0'),
            fc.constant('Same Day'),
            fc.string({minLength: 1, maxLength: 5}),
        ),
        requiresAddress: fc.constant(requiresAddress),
    })

describe('requiresDeliveryAddress - Property Tests', () => {
    it('Property 4: a collection method never asks for an address, at any fee or lead time', () => {
        fc.assert(
            fc.property(methodArb(false), (method) => {
                expect(requiresDeliveryAddress(method)).toBe(false)
            }),
            {numRuns: 200},
        )
    })

    it('Property 4: a delivery method always asks for an address, at any fee or lead time', () => {
        fc.assert(
            fc.property(methodArb(true), (method) => {
                expect(requiresDeliveryAddress(method)).toBe(true)
            }),
            {numRuns: 200},
        )
    })

    it('Property 4: free same-day collection — the exact shape the old inference got wrong', () => {
        const inStorePickup: ShippingMethod = {
            id: 'sm-pickup',
            name: 'In-Store Pickup',
            baseFee: 0,
            estimatedDays: 'Same Day',
            requiresAddress: false,
        }
        expect(requiresDeliveryAddress(inStorePickup)).toBe(false)
    })

    it('Property 4: no selection yet asks for nothing', () => {
        expect(requiresDeliveryAddress(null)).toBe(false)
        expect(requiresDeliveryAddress(undefined)).toBe(false)
    })
})
