import {describe, expect, it} from 'vitest'
import fc from 'fast-check'
import {toDto} from '../mappers'
import type {WholesaleApplicationFormValues} from '../wholesaleApplicationSchema'

/**
 * Property 2: Status is always PENDING
 *
 * For ANY valid form values (regardless of any other field values),
 * the DTO SHALL always include `status: 'PENDING'`.
 */

const nonEmptyStringArb = fc
    .string({minLength: 1, maxLength: 50})
    .filter((s) => s.trim().length > 0)

const formValuesArb: fc.Arbitrary<WholesaleApplicationFormValues> = fc.record({
    firstName: nonEmptyStringArb,
    lastName: nonEmptyStringArb,
    applicantEmail: fc.emailAddress(),
    phone: nonEmptyStringArb,
    companyName: nonEmptyStringArb,
    purchaseOrderRequired: fc.boolean(),
    vatNumber: fc.option(nonEmptyStringArb, {nil: undefined}),
    regNumber: nonEmptyStringArb,
    physicalAddressLine1: nonEmptyStringArb,
    physicalAddressLine2: fc.option(nonEmptyStringArb, {nil: undefined}),
    physicalSuburb: nonEmptyStringArb,
    physicalCity: nonEmptyStringArb,
    physicalProvince: nonEmptyStringArb,
    physicalPostalCode: nonEmptyStringArb,
    sameAsPhysical: fc.boolean(),
    postalAddressLine1: fc.option(nonEmptyStringArb, {nil: undefined}),
    postalAddressLine2: fc.option(nonEmptyStringArb, {nil: undefined}),
    postalSuburb: fc.option(nonEmptyStringArb, {nil: undefined}),
    postalCity: fc.option(nonEmptyStringArb, {nil: undefined}),
    postalProvince: fc.option(nonEmptyStringArb, {nil: undefined}),
    postalPostalCode: fc.option(nonEmptyStringArb, {nil: undefined}),
    notes: fc.option(fc.string({maxLength: 1000}), {nil: undefined}),
})

describe('toDto — Property 2: Status is always PENDING', () => {
    it('DTO status is always PENDING regardless of input values', () => {
        fc.assert(
            fc.property(formValuesArb, (values) => {
                const dto = toDto(values)
                expect(dto.status).toBe('PENDING')
            }),
            {numRuns: 100}
        )
    })
})
