import {describe, expect, it} from 'vitest'
import fc from 'fast-check'
import {toDto} from '../mappers'
import type {WholesaleApplicationFormValues} from '../wholesaleApplicationSchema'

// Arbitrary for non-empty trimmed strings
const nonEmptyStringArb = fc.string({minLength: 1, maxLength: 50}).filter((s) => s.trim().length > 0)

// Arbitrary for valid form values with sameAsPhysical = true
const formValuesWithSameAsPhysicalArb: fc.Arbitrary<WholesaleApplicationFormValues> = fc.record({
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
    sameAsPhysical: fc.constant(true),
    postalAddressLine1: fc.option(nonEmptyStringArb, {nil: undefined}),
    postalAddressLine2: fc.option(nonEmptyStringArb, {nil: undefined}),
    postalSuburb: fc.option(nonEmptyStringArb, {nil: undefined}),
    postalCity: fc.option(nonEmptyStringArb, {nil: undefined}),
    postalProvince: fc.option(nonEmptyStringArb, {nil: undefined}),
    postalPostalCode: fc.option(nonEmptyStringArb, {nil: undefined}),
    notes: fc.option(fc.string({maxLength: 1000}), {nil: undefined}),
})

/**
 * **Validates: Requirements 5.3**
 *
 * Property 1: Same-as-physical copies address fields
 *
 * For ANY valid form values where sameAsPhysical is true,
 * the DTO postal fields SHALL equal the physical address fields.
 */
describe('toDto — Property: sameAsPhysical copies address fields', () => {
    it('postal fields in DTO equal physical fields when sameAsPhysical is true', () => {
        fc.assert(
            fc.property(formValuesWithSameAsPhysicalArb, (values) => {
                const dto = toDto(values)

                expect(dto.postalAddressLine1).toBe(values.physicalAddressLine1)
                expect(dto.postalAddressLine2).toBe(values.physicalAddressLine2 ?? '')
                expect(dto.postalSuburb).toBe(values.physicalSuburb)
                expect(dto.postalCity).toBe(values.physicalCity)
                expect(dto.postalProvince).toBe(values.physicalProvince)
                expect(dto.postalPostalCode).toBe(values.physicalPostalCode)
            }),
            {numRuns: 100},
        )
    })
})
