import { describe, expect, it } from 'vitest'
import fc from 'fast-check'
import { toDto } from '../mappers'
import type { WholesaleApplicationFormValues } from '../wholesaleApplicationSchema'

/**
 * Feature: wholesale-application-enhancements, Property 4: Same as company address copies physical to postal
 *
 * **Validates: Requirements 4.3**
 *
 * For any form submission where `sameAsPhysical` is true, the resulting DTO
 * (from the `toDto` mapper) SHALL have postal address columns equal to the
 * physical address columns. Conversely, when `sameAsPhysical` is false, the
 * postal columns SHALL reflect the independently provided postal input.
 */

// Arbitrary for non-empty trimmed strings (used for required fields)
const nonEmptyStringArb = fc
  .string({ minLength: 1, maxLength: 50 })
  .filter((s) => s.trim().length > 0)

// Arbitrary for optional strings (may be undefined)
const optionalStringArb = fc.option(nonEmptyStringArb, { nil: undefined })

// Arbitrary for optional email-or-empty fields (matches Zod: email or '')
const optionalEmailArb = fc.option(fc.emailAddress(), { nil: undefined })

// Builds a complete WholesaleApplicationFormValues arbitrary with a fixed sameAsPhysical value
function formValuesArb(sameAsPhysical: boolean): fc.Arbitrary<WholesaleApplicationFormValues> {
  return fc.record({
    // Applicant
    firstName: nonEmptyStringArb,
    lastName: nonEmptyStringArb,
    applicantEmail: fc.emailAddress(),
    accountEmail: optionalEmailArb,
    phone: nonEmptyStringArb,

    // Company
    companyName: nonEmptyStringArb,
    tradingName: optionalStringArb,
    companyPhone: optionalStringArb,
    companyEmail: optionalEmailArb,
    vatNumber: optionalStringArb,
    regNumber: optionalStringArb,

    // Physical address
    physicalAddressLine1: nonEmptyStringArb,
    physicalAddressLine2: optionalStringArb,
    physicalSuburb: optionalStringArb,
    physicalCity: nonEmptyStringArb,
    physicalProvince: nonEmptyStringArb,
    physicalPostalCode: nonEmptyStringArb,

    // Same as physical toggle
    sameAsPhysical: fc.constant(sameAsPhysical),

    // Postal address (independent values for the false case)
    postalAddressLine1: optionalStringArb,
    postalAddressLine2: optionalStringArb,
    postalSuburb: optionalStringArb,
    postalCity: optionalStringArb,
    postalProvince: optionalStringArb,
    postalPostalCode: optionalStringArb,

    // Finance contact
    financeContactName: optionalStringArb,
    financeContactEmail: optionalEmailArb,
    financeContactPhone: optionalStringArb,

    // PO
    purchaseOrderRequired: fc.boolean(),

    notes: fc.option(fc.string({ maxLength: 1000 }), { nil: undefined }),
  })
}

describe('Feature: wholesale-application-enhancements, Property 4: Same as company address copies physical to postal', () => {
  /**
   * **Validates: Requirements 4.3**
   *
   * When sameAsPhysical is true, all postal address fields in the DTO
   * SHALL equal the corresponding physical address fields.
   */
  it('copies physical address to postal when sameAsPhysical is true', () => {
    fc.assert(
      fc.property(formValuesArb(true), (values) => {
        const dto = toDto(values)

        expect(dto.postalAddressLine1).toBe(values.physicalAddressLine1)
        expect(dto.postalAddressLine2).toBe(values.physicalAddressLine2 ?? '')
        expect(dto.postalSuburb).toBe(values.physicalSuburb ?? '')
        expect(dto.postalCity).toBe(values.physicalCity)
        expect(dto.postalProvince).toBe(values.physicalProvince)
        expect(dto.postalPostalCode).toBe(values.physicalPostalCode)
      }),
      { numRuns: 100 },
    )
  })

  /**
   * **Validates: Requirements 4.3**
   *
   * When sameAsPhysical is false, the postal address fields in the DTO
   * SHALL reflect the independently provided postal input values (defaulting
   * to empty string when undefined).
   */
  it('uses independent postal values when sameAsPhysical is false', () => {
    fc.assert(
      fc.property(formValuesArb(false), (values) => {
        const dto = toDto(values)

        expect(dto.postalAddressLine1).toBe(values.postalAddressLine1 ?? '')
        expect(dto.postalAddressLine2).toBe(values.postalAddressLine2 ?? '')
        expect(dto.postalSuburb).toBe(values.postalSuburb ?? '')
        expect(dto.postalCity).toBe(values.postalCity ?? '')
        expect(dto.postalProvince).toBe(values.postalProvince ?? '')
        expect(dto.postalPostalCode).toBe(values.postalPostalCode ?? '')
      }),
      { numRuns: 100 },
    )
  })
})
