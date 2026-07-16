import {describe, expect, it} from 'vitest'
import fc from 'fast-check'
import {wholesaleApplicationSchema} from '../wholesaleApplicationSchema'

/**
 * Feature: wholesale-application-enhancements
 *
 * Property-based tests for the Zod schema validation logic.
 */

// --- Shared arbitraries ---

const nonEmptyStringArb = fc.string({minLength: 1, maxLength: 50}).filter((s) => s.trim().length > 0)

/**
 * Generates email addresses that Zod's `.email()` validator will accept.
 * Zod's email validation rejects:
 * - consecutive dots in local part
 * - leading/trailing dots in local part
 * - special chars that RFC allows but Zod doesn't
 *
 * We generate simple, realistic emails: alphanumeric local + domain.tld
 */
const zodValidEmailArb = fc
    .tuple(
        // local part: 1-8 lowercase alphanumeric chars (no dots, no specials — always safe)
        fc.stringMatching(/^[a-z][a-z0-9]{0,7}$/),
        // domain label: 2-8 lowercase alpha chars
        fc.stringMatching(/^[a-z]{2,8}$/),
        // TLD: 2-4 lowercase letters
        fc.stringMatching(/^[a-z]{2,4}$/),
    )
    .map(([local, domain, tld]) => `${local}@${domain}.${tld}`)

/** All required fields with valid values */
const validRequiredFieldsArb = fc.record({
    firstName: nonEmptyStringArb,
    lastName: nonEmptyStringArb,
    applicantEmail: zodValidEmailArb,
    phone: nonEmptyStringArb,
    companyName: nonEmptyStringArb,
    physicalAddressLine1: nonEmptyStringArb,
    physicalCity: nonEmptyStringArb,
    physicalProvince: nonEmptyStringArb,
    physicalPostalCode: nonEmptyStringArb,
})

/** The list of required field keys — blanking any one should cause rejection */
const requiredFields = [
    'firstName',
    'lastName',
    'applicantEmail',
    'phone',
    'companyName',
    'physicalAddressLine1',
    'physicalCity',
    'physicalProvince',
    'physicalPostalCode',
] as const

// --- Property 1: Required field validation blocks submission ---

describe('Feature: wholesale-application-enhancements, Property 1: Required field validation blocks submission', () => {
    /**
     * **Validates: Requirements 3.2**
     *
     * For any form input where at least one required field is blank or missing,
     * the schema validation SHALL reject the input.
     */
    it('rejects input when at least one required field is blank or missing', () => {
        const fieldToBlankArb = fc.constantFrom(...requiredFields)

        fc.assert(
            fc.property(validRequiredFieldsArb, fieldToBlankArb, fc.boolean(), (baseInput, fieldToBlank, useEmpty) => {
                // Either set the field to empty string or remove it entirely
                const input = {...baseInput}
                if (useEmpty) {
                    ;(input as Record<string, string>)[fieldToBlank] = ''
                } else {
                    delete (input as Record<string, string | undefined>)[fieldToBlank]
                }

                const result = wholesaleApplicationSchema.safeParse(input)
                expect(result.success).toBe(false)
            }),
            {numRuns: 100},
        )
    })

    it('rejects input when multiple required fields are blank', () => {
        const subsetArb = fc.subarray([...requiredFields], {minLength: 1})

        fc.assert(
            fc.property(validRequiredFieldsArb, subsetArb, (baseInput, fieldsToBlank) => {
                const input = {...baseInput}
                for (const field of fieldsToBlank) {
                    ;(input as Record<string, string>)[field] = ''
                }

                const result = wholesaleApplicationSchema.safeParse(input)
                expect(result.success).toBe(false)
            }),
            {numRuns: 100},
        )
    })

    it('accepts input when ALL required fields are valid and non-empty', () => {
        fc.assert(
            fc.property(validRequiredFieldsArb, (input) => {
                const result = wholesaleApplicationSchema.safeParse(input)
                expect(result.success).toBe(true)
            }),
            {numRuns: 100},
        )
    })
})

// --- Property 2: Email format validation ---

describe('Feature: wholesale-application-enhancements, Property 2: Email format validation', () => {
    /**
     * **Validates: Requirements 3.3**
     *
     * For any string provided to an email field (applicantEmail, accountEmail,
     * companyEmail, financeContactEmail), if the string does not conform to email
     * format, the Zod schema SHALL reject it; if it does conform, the schema SHALL
     * accept it.
     */

    // Generate strings that are guaranteed NOT to be valid emails:
    // No '@' character at all
    const invalidEmailNoAtArb = fc
        .stringMatching(/^[a-z0-9 ]{1,20}$/)
        .filter((s) => !s.includes('@'))

    // Has '@' but missing dot in domain part (everything after @)
    const invalidEmailNoDotInDomainArb = fc
        .tuple(
            fc.stringMatching(/^[a-z]{1,8}$/),
            fc.stringMatching(/^[a-z]{1,8}$/),
        )
        .map(([local, domain]) => `${local}@${domain}`)

    // Combined invalid email arbitrary
    const invalidEmailArb = fc.oneof(invalidEmailNoAtArb, invalidEmailNoDotInDomainArb)

    describe('applicantEmail rejects invalid email formats', () => {
        it('rejects non-email strings for applicantEmail', () => {
            fc.assert(
                fc.property(validRequiredFieldsArb, invalidEmailArb, (baseInput, invalidEmail) => {
                    const input = {...baseInput, applicantEmail: invalidEmail}
                    const result = wholesaleApplicationSchema.safeParse(input)
                    expect(result.success).toBe(false)
                    if (!result.success) {
                        const emailIssue = result.error.issues.find((i) => i.path.includes('applicantEmail'))
                        expect(emailIssue).toBeDefined()
                    }
                }),
                {numRuns: 100},
            )
        })
    })

    describe('applicantEmail accepts valid email formats', () => {
        it('accepts valid email addresses for applicantEmail', () => {
            fc.assert(
                fc.property(validRequiredFieldsArb, zodValidEmailArb, (baseInput, validEmail) => {
                    const input = {...baseInput, applicantEmail: validEmail}
                    const result = wholesaleApplicationSchema.safeParse(input)
                    expect(result.success).toBe(true)
                }),
                {numRuns: 100},
            )
        })
    })

    describe('optional email fields reject invalid formats when provided', () => {
        const optionalEmailFields = ['accountEmail', 'companyEmail', 'financeContactEmail'] as const

        it('rejects non-email strings for optional email fields', () => {
            const fieldArb = fc.constantFrom(...optionalEmailFields)

            fc.assert(
                fc.property(validRequiredFieldsArb, fieldArb, invalidEmailArb, (baseInput, field, invalidEmail) => {
                    const input = {...baseInput, [field]: invalidEmail}
                    const result = wholesaleApplicationSchema.safeParse(input)
                    expect(result.success).toBe(false)
                    if (!result.success) {
                        const emailIssue = result.error.issues.find((i) => i.path.includes(field))
                        expect(emailIssue).toBeDefined()
                    }
                }),
                {numRuns: 100},
            )
        })

        it('accepts valid email addresses for optional email fields', () => {
            const fieldArb = fc.constantFrom(...optionalEmailFields)

            fc.assert(
                fc.property(validRequiredFieldsArb, fieldArb, zodValidEmailArb, (baseInput, field, validEmail) => {
                    const input = {...baseInput, [field]: validEmail}
                    const result = wholesaleApplicationSchema.safeParse(input)
                    expect(result.success).toBe(true)
                }),
                {numRuns: 100},
            )
        })

        it('accepts empty string for optional email fields (treated as not provided)', () => {
            const fieldArb = fc.constantFrom(...optionalEmailFields)

            fc.assert(
                fc.property(validRequiredFieldsArb, fieldArb, (baseInput, field) => {
                    const input = {...baseInput, [field]: ''}
                    const result = wholesaleApplicationSchema.safeParse(input)
                    expect(result.success).toBe(true)
                }),
                {numRuns: 100},
            )
        })
    })
})
