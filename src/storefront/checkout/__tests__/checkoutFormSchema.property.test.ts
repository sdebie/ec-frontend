// Feature: checkout, Property 3: Contact form email validation
// Feature: checkout, Property 5: Delivery address validation blocks incomplete submissions
import {describe, expect, it} from 'vitest'
import * as fc from 'fast-check'
import {checkoutFormSchema} from '../checkoutFormSchema'
import {isDeliveryMethod} from '../utils/isDeliveryMethod'

// Valid base form data — all other required fields are valid so only email affects the result
const validBaseData = {
    firstName: 'Jane',
    lastName: 'Doe',
    shippingMethodId: 'sm-delivery-01',
    requiresAddress: false,
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


// Address validation lives in the schema (superRefine), so these properties
// drive the REAL schema and the REAL delivery predicate. A local
// re-implementation of the page's submit handler would let them pass while
// production behaved differently.

const ADDRESS_FIELDS = ['streetAddress', 'city', 'province', 'postalCode'] as const

/** Address issues the schema raised, by field name. */
function addressIssues(values: Record<string, unknown>): string[] {
    const result = checkoutFormSchema.safeParse({...validBaseData, email: 'a@b.com', ...values})
    if (result.success) return []
    return result.error.issues
        .map((issue) => String(issue.path[0]))
        .filter((field) => (ADDRESS_FIELDS as readonly string[]).includes(field))
}

// Delivery methods: baseFee > 0 OR estimatedDays non-null and not "0"
const deliveryMethodArb = fc.oneof(
    fc.record({
        id: fc.constant('m1'),
        name: fc.constant('Courier'),
        baseFee: fc.float({min: Math.fround(0.01), max: Math.fround(1000), noNaN: true}).filter((n) => n > 0),
        estimatedDays: fc.oneof(fc.constant(null), fc.string({minLength: 1, maxLength: 5})),
    }),
    fc.record({
        id: fc.constant('m2'),
        name: fc.constant('Courier'),
        baseFee: fc.constant(0),
        estimatedDays: fc.string({minLength: 1, maxLength: 5}).filter((s) => s !== '0'),
    })
)

const collectionMethodArb = fc.record({
    id: fc.constant('m3'),
    name: fc.constant('Collection'),
    baseFee: fc.constant(0),
    estimatedDays: fc.oneof(fc.constant(null), fc.constant('0')),
})

const addressFieldArb = fc.oneof(
    fc.constant(undefined),
    fc.constant(''),
    fc.string({minLength: 1, maxLength: 50}).filter((s) => s.trim().length > 0)
)

const partialAddressArb = fc
    .record({
        streetAddress: addressFieldArb,
        city: addressFieldArb,
        province: addressFieldArb,
        postalCode: addressFieldArb,
    })
    .filter((addr) => !addr.streetAddress || !addr.city || !addr.province || !addr.postalCode)

describe('checkoutFormSchema - Delivery Address Validation Property Tests', () => {
    it('Property 5: the delivery predicate decides whether the address is required', () => {
        fc.assert(
            fc.property(deliveryMethodArb, (method) => {
                expect(isDeliveryMethod(method)).toBe(true)
            }),
            {numRuns: 100}
        )
        fc.assert(
            fc.property(collectionMethodArb, (method) => {
                expect(isDeliveryMethod(method)).toBe(false)
            }),
            {numRuns: 100}
        )
    })

    it('Property 5: delivery address validation catches exactly the missing fields', () => {
        fc.assert(
            fc.property(partialAddressArb, (address) => {
                const issues = addressIssues({requiresAddress: true, ...address})

                const expected = ADDRESS_FIELDS.filter(
                    (field) => !address[field]?.trim()
                )

                expect(issues.length).toBeGreaterThan(0)
                expect(issues.sort()).toEqual([...expected].sort())
            }),
            {numRuns: 100}
        )
    })

    it('Property 5: complete address with delivery method produces no errors', () => {
        const completeAddressArb = fc.record({
            streetAddress: fc.string({minLength: 1, maxLength: 50}).filter((s) => s.trim().length > 0),
            city: fc.string({minLength: 1, maxLength: 30}).filter((s) => s.trim().length > 0),
            province: fc.string({minLength: 1, maxLength: 30}).filter((s) => s.trim().length > 0),
            postalCode: fc.string({minLength: 1, maxLength: 10}).filter((s) => s.trim().length > 0),
        })

        fc.assert(
            fc.property(completeAddressArb, (address) => {
                expect(addressIssues({requiresAddress: true, ...address})).toEqual([])
            }),
            {numRuns: 100}
        )
    })

    it('Property 5: collection method never produces address errors regardless of address state', () => {
        const anyAddressArb = fc.record({
            streetAddress: addressFieldArb,
            city: addressFieldArb,
            province: addressFieldArb,
            postalCode: addressFieldArb,
        })

        fc.assert(
            fc.property(anyAddressArb, (address) => {
                expect(addressIssues({requiresAddress: false, ...address})).toEqual([])
            }),
            {numRuns: 100}
        )
    })
})
