// Feature: checkout, Property 3: Contact form email validation
// Feature: checkout, Property 5: Delivery address validation blocks incomplete submissions
import {describe, expect, it} from 'vitest'
import * as fc from 'fast-check'
import {checkoutFormSchema} from '../checkoutFormSchema'

// Valid base form data — all other required fields are valid so only email affects the result
const validBaseData = {
    firstName: 'Jane',
    lastName: 'Doe',
    shippingMethodId: 'sm-delivery-01',
    paymentMethod: 'PAYFAST',
}

// Arbitrary for valid emails: user@domain.tld
const validEmailArb = fc
    .tuple(
        fc.string({minLength: 1, maxLength: 10}).filter((s) => /^[a-z0-9]+$/.test(s)),
        fc.string({minLength: 1, maxLength: 10}).filter((s) => /^[a-z0-9]+$/.test(s)),
        fc.constantFrom('com', 'org', 'net', 'co.za', 'io')
    )
    .map(([user, domain, tld]) => `${user}@${domain}.${tld}`)

// Arbitrary for invalid emails: strings missing '@' or missing domain part after '@'
const invalidEmailNoAtArb = fc
    .string({minLength: 1})
    .filter((s) => !s.includes('@'))

const invalidEmailNoDomainArb = fc
    .string({minLength: 1, maxLength: 20})
    .filter((s) => /^[a-z0-9]+$/.test(s))
    .map((user) => `${user}@`)

const invalidEmailArb = fc.oneof(
    invalidEmailNoAtArb,
    invalidEmailNoDomainArb,
    fc.constant(''),
    fc.constant('@'),
    fc.constant('user@'),
    fc.constant('@domain.com')
)

describe('checkoutFormSchema - Property Tests', () => {
    // **Validates: Requirements 3.1**
    it('Property 3: invalid emails produce validation error', () => {
        fc.assert(
            fc.property(invalidEmailArb, (invalidEmail) => {
                const result = checkoutFormSchema.safeParse({
                    ...validBaseData,
                    email: invalidEmail,
                })

                expect(result.success).toBe(false)
                if (!result.success) {
                    const emailErrors = result.error.issues.filter(
                        (issue) => issue.path[0] === 'email'
                    )
                    expect(emailErrors.length).toBeGreaterThan(0)
                }
            }),
            {numRuns: 100}
        )
    })

    // **Validates: Requirements 3.1**
    it('Property 3: valid emails pass validation', () => {
        fc.assert(
            fc.property(validEmailArb, (validEmail) => {
                const result = checkoutFormSchema.safeParse({
                    ...validBaseData,
                    email: validEmail,
                })

                expect(result.success).toBe(true)
            }),
            {numRuns: 100}
        )
    })
})


// Helper function that mirrors CheckoutPage.handleSubmit validation logic
// Address validation is NOT in the Zod schema — it's done via RHF setError()
// because the schema has no access to the shipping methods list.
function validateDeliveryAddress(
    shippingMethod: { baseFee: number; estimatedDays: string | null },
    address: { streetAddress?: string; city?: string; province?: string; postalCode?: string }
): string[] {
    const isDelivery =
        shippingMethod.baseFee > 0 ||
        (shippingMethod.estimatedDays !== null && shippingMethod.estimatedDays !== '0')

    if (!isDelivery) return []

    const errors: string[] = []
    if (!address.streetAddress) errors.push('streetAddress')
    if (!address.city) errors.push('city')
    if (!address.province) errors.push('province')
    if (!address.postalCode) errors.push('postalCode')
    return errors
}

// Arbitrary for delivery shipping methods: baseFee > 0 OR estimatedDays non-null and not "0"
const deliveryMethodArb = fc.oneof(
    // baseFee > 0 (any estimatedDays)
    fc.record({
        baseFee: fc.float({min: Math.fround(0.01), max: Math.fround(1000), noNaN: true}).filter((n) => n > 0),
        estimatedDays: fc.oneof(
            fc.constant(null),
            fc.string({minLength: 1, maxLength: 5})
        ),
    }),
    // baseFee = 0 but estimatedDays non-null and not "0"
    fc.record({
        baseFee: fc.constant(0),
        estimatedDays: fc
            .string({minLength: 1, maxLength: 5})
            .filter((s) => s !== '0'),
    })
)

// Address fields — each can be present (non-empty string) or missing (empty/undefined)
const addressFieldArb = fc.oneof(
    fc.constant(undefined),
    fc.constant(''),
    fc.string({minLength: 1, maxLength: 50}).filter((s) => s.trim().length > 0)
)

// Arbitrary for partial address state (at least one field missing)
const partialAddressArb = fc
    .record({
        streetAddress: addressFieldArb,
        city: addressFieldArb,
        province: addressFieldArb,
        postalCode: addressFieldArb,
    })
    .filter((addr) => {
        // Ensure at least one field is empty/undefined (partial address)
        return (
            !addr.streetAddress ||
            !addr.city ||
            !addr.province ||
            !addr.postalCode
        )
    })

describe('checkoutFormSchema - Delivery Address Validation Property Tests', () => {
    // **Validates: Requirements 4.5**
    it('Property 5: delivery address validation catches exactly the missing fields', () => {
        fc.assert(
            fc.property(
                deliveryMethodArb,
                partialAddressArb,
                (method, address) => {
                    const errors = validateDeliveryAddress(method, address)

                    // Errors should be non-empty since we have a partial address with a delivery method
                    expect(errors.length).toBeGreaterThan(0)

                    // Each missing field should be in errors
                    const expectedErrors: string[] = []
                    if (!address.streetAddress) expectedErrors.push('streetAddress')
                    if (!address.city) expectedErrors.push('city')
                    if (!address.province) expectedErrors.push('province')
                    if (!address.postalCode) expectedErrors.push('postalCode')

                    expect(errors).toEqual(expectedErrors)
                    expect(errors.length).toBe(expectedErrors.length)
                }
            ),
            {numRuns: 100}
        )
    })

    // **Validates: Requirements 4.5**
    it('Property 5: complete address with delivery method produces no errors', () => {
        const completeAddressArb = fc.record({
            streetAddress: fc.string({minLength: 1, maxLength: 50}).filter((s) => s.trim().length > 0),
            city: fc.string({minLength: 1, maxLength: 30}).filter((s) => s.trim().length > 0),
            province: fc.string({minLength: 1, maxLength: 30}).filter((s) => s.trim().length > 0),
            postalCode: fc.string({minLength: 1, maxLength: 10}).filter((s) => s.trim().length > 0),
        })

        fc.assert(
            fc.property(deliveryMethodArb, completeAddressArb, (method, address) => {
                const errors = validateDeliveryAddress(method, address)
                expect(errors).toEqual([])
            }),
            {numRuns: 100}
        )
    })

    // **Validates: Requirements 4.5**
    it('Property 5: collection method never produces address errors regardless of address state', () => {
        // Collection methods: baseFee = 0 AND (estimatedDays is null or "0")
        const collectionMethodArb = fc.record({
            baseFee: fc.constant(0),
            estimatedDays: fc.oneof(fc.constant(null), fc.constant('0')),
        })

        const anyAddressArb = fc.record({
            streetAddress: addressFieldArb,
            city: addressFieldArb,
            province: addressFieldArb,
            postalCode: addressFieldArb,
        })

        fc.assert(
            fc.property(collectionMethodArb, anyAddressArb, (method, address) => {
                const errors = validateDeliveryAddress(method, address)
                expect(errors).toEqual([])
            }),
            {numRuns: 100}
        )
    })
})
