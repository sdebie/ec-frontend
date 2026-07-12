import {describe, expect, it} from 'vitest'
import {wholesaleApplicationSchema} from '../wholesaleApplicationSchema.ts'

const validInput = {
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane@example.com',
    phone: '0821234567',
    companyName: 'Acme Trading',
    regNumber: '2024/123456/07',
    physicalAddressLine1: '10 Main Road',
    physicalSuburb: 'Sandton',
    physicalCity: 'Johannesburg',
    physicalProvince: 'Gauteng',
    physicalPostalCode: '2196',
}

describe('wholesaleApplicationSchema', () => {
    it('accepts a valid full form with all optional fields filled', () => {
        const input = {
            ...validInput,
            vatNumber: '4123456789',
            physicalAddressLine2: 'Suite 5',
            sameAsPhysical: true,
            postalAddressLine1: '10 Main Road',
            postalAddressLine2: 'Suite 5',
            postalSuburb: 'Sandton',
            postalCity: 'Johannesburg',
            postalProvince: 'Gauteng',
            postalPostalCode: '2196',
            notes: 'We would like to order in bulk monthly.',
        }

        const result = wholesaleApplicationSchema.safeParse(input)
        expect(result.success).toBe(true)
    })

    it('accepts missing optional fields (vatNumber, physicalAddressLine2, postal fields, notes)', () => {
        const result = wholesaleApplicationSchema.safeParse(validInput)
        expect(result.success).toBe(true)
    })

    it('rejects an invalid email format', () => {
        const input = {...validInput, email: 'not-an-email'}
        const result = wholesaleApplicationSchema.safeParse(input)
        expect(result.success).toBe(false)
        if (!result.success) {
            const emailError = result.error.issues.find((i) => i.path.includes('email'))
            expect(emailError).toBeDefined()
        }
    })

    it('accepts a valid email address', () => {
        const input = {...validInput, email: 'wholesale@company.co.za'}
        const result = wholesaleApplicationSchema.safeParse(input)
        expect(result.success).toBe(true)
    })

    it('accepts notes of exactly 1000 characters', () => {
        const input = {...validInput, notes: 'a'.repeat(1000)}
        const result = wholesaleApplicationSchema.safeParse(input)
        expect(result.success).toBe(true)
    })

    it('rejects notes exceeding 1000 characters', () => {
        const input = {...validInput, notes: 'a'.repeat(1001)}
        const result = wholesaleApplicationSchema.safeParse(input)
        expect(result.success).toBe(false)
        if (!result.success) {
            const notesError = result.error.issues.find((i) => i.path.includes('notes'))
            expect(notesError).toBeDefined()
        }
    })

    it('rejects required fields when provided as empty strings', () => {
        const input = {
            ...validInput,
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            companyName: '',
            regNumber: '',
            physicalAddressLine1: '',
            physicalSuburb: '',
            physicalCity: '',
            physicalProvince: '',
            physicalPostalCode: '',
        }

        const result = wholesaleApplicationSchema.safeParse(input)
        expect(result.success).toBe(false)
        if (!result.success) {
            const paths = result.error.issues.map((i) => i.path[0])
            expect(paths).toContain('firstName')
            expect(paths).toContain('lastName')
            expect(paths).toContain('phone')
            expect(paths).toContain('companyName')
            expect(paths).toContain('regNumber')
            expect(paths).toContain('physicalAddressLine1')
            expect(paths).toContain('physicalSuburb')
            expect(paths).toContain('physicalCity')
            expect(paths).toContain('physicalProvince')
            expect(paths).toContain('physicalPostalCode')
        }
    })

    it('defaults sameAsPhysical to false when not provided', () => {
        const result = wholesaleApplicationSchema.safeParse(validInput)
        expect(result.success).toBe(true)
        if (result.success) {
            expect(result.data.sameAsPhysical).toBe(false)
        }
    })

    it('accepts company section without vatNumber (Req 3.2)', () => {
        const input = {...validInput}
        // Explicitly not providing vatNumber
        const result = wholesaleApplicationSchema.safeParse(input)
        expect(result.success).toBe(true)
        if (result.success) {
            expect(result.data.vatNumber).toBeUndefined()
        }
    })
})
