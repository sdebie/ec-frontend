import {describe, expect, it} from 'vitest'
import {wholesaleApplicationSchema} from '../wholesaleApplicationSchema'

const validInput = {
    firstName: 'Jane',
    lastName: 'Doe',
    applicantEmail: 'jane@example.com',
    phone: '0821234567',
    companyName: 'Acme Trading',
    physicalAddressLine1: '10 Main Road',
    physicalCity: 'Johannesburg',
    physicalProvince: 'Gauteng',
    physicalPostalCode: '2196',
    // Mirror the company address so the minimal fixture carries no delivery address.
    sameAsPhysical: true,
}

const validDeliveryAddress = {
    postalAddressLine1: '789 Depot Rd',
    postalCity: 'Durban',
    postalProvince: 'KwaZulu-Natal',
    postalPostalCode: '4001',
}

describe('wholesaleApplicationSchema', () => {
    it('accepts a valid full form with all optional fields filled', () => {
        const input = {
            ...validInput,
            accountEmail: 'jane.account@example.com',
            tradingName: 'Acme Wholesale',
            companyPhone: '0111234567',
            companyEmail: 'info@acme.co.za',
            vatNumber: '4123456789',
            regNumber: '2024/123456/07',
            physicalAddressLine2: 'Suite 5',
            physicalSuburb: 'Sandton',
            sameAsPhysical: true,
            postalAddressLine1: '10 Main Road',
            postalAddressLine2: 'Suite 5',
            postalSuburb: 'Sandton',
            postalCity: 'Johannesburg',
            postalProvince: 'Gauteng',
            postalPostalCode: '2196',
            financeContactName: 'John Finance',
            financeContactEmail: 'finance@acme.co.za',
            financeContactPhone: '0119876543',
            purchaseOrderRequired: true,
            notes: 'We would like to order in bulk monthly.',
        }

        const result = wholesaleApplicationSchema.safeParse(input)
        expect(result.success).toBe(true)
    })

    it('accepts missing optional fields', () => {
        const result = wholesaleApplicationSchema.safeParse(validInput)
        expect(result.success).toBe(true)
    })

    it('rejects an invalid applicantEmail format', () => {
        const input = {...validInput, applicantEmail: 'not-an-email'}
        const result = wholesaleApplicationSchema.safeParse(input)
        expect(result.success).toBe(false)
        if (!result.success) {
            const emailError = result.error.issues.find((i) => i.path.includes('applicantEmail'))
            expect(emailError).toBeDefined()
        }
    })

    it('accepts a valid applicantEmail address', () => {
        const input = {...validInput, applicantEmail: 'wholesale@company.co.za'}
        const result = wholesaleApplicationSchema.safeParse(input)
        expect(result.success).toBe(true)
    })

    it('rejects an invalid accountEmail format', () => {
        const input = {...validInput, accountEmail: 'bad-email'}
        const result = wholesaleApplicationSchema.safeParse(input)
        expect(result.success).toBe(false)
        if (!result.success) {
            const emailError = result.error.issues.find((i) => i.path.includes('accountEmail'))
            expect(emailError).toBeDefined()
        }
    })

    it('accepts accountEmail as empty string', () => {
        const input = {...validInput, accountEmail: ''}
        const result = wholesaleApplicationSchema.safeParse(input)
        expect(result.success).toBe(true)
    })

    it('rejects an invalid companyEmail format', () => {
        const input = {...validInput, companyEmail: 'not-valid'}
        const result = wholesaleApplicationSchema.safeParse(input)
        expect(result.success).toBe(false)
        if (!result.success) {
            const emailError = result.error.issues.find((i) => i.path.includes('companyEmail'))
            expect(emailError).toBeDefined()
        }
    })

    it('accepts companyEmail as empty string', () => {
        const input = {...validInput, companyEmail: ''}
        const result = wholesaleApplicationSchema.safeParse(input)
        expect(result.success).toBe(true)
    })

    it('rejects an invalid financeContactEmail format', () => {
        const input = {...validInput, financeContactEmail: 'bad'}
        const result = wholesaleApplicationSchema.safeParse(input)
        expect(result.success).toBe(false)
        if (!result.success) {
            const emailError = result.error.issues.find((i) => i.path.includes('financeContactEmail'))
            expect(emailError).toBeDefined()
        }
    })

    it('accepts financeContactEmail as empty string', () => {
        const input = {...validInput, financeContactEmail: ''}
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
            applicantEmail: '',
            phone: '',
            companyName: '',
            physicalAddressLine1: '',
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
            expect(paths).toContain('applicantEmail')
            expect(paths).toContain('phone')
            expect(paths).toContain('companyName')
            expect(paths).toContain('physicalAddressLine1')
            expect(paths).toContain('physicalCity')
            expect(paths).toContain('physicalProvince')
            expect(paths).toContain('physicalPostalCode')
        }
    })

    it('regNumber and physicalSuburb are optional (not required)', () => {
        // validInput does not include regNumber or physicalSuburb
        const result = wholesaleApplicationSchema.safeParse(validInput)
        expect(result.success).toBe(true)
        if (result.success) {
            expect(result.data.regNumber).toBeUndefined()
            expect(result.data.physicalSuburb).toBeUndefined()
        }
    })

    it('defaults sameAsPhysical to false when not provided', () => {
        // Omitting sameAsPhysical means the delivery address is required, so provide one.
        const {sameAsPhysical: _omitted, ...withoutFlag} = validInput
        const result = wholesaleApplicationSchema.safeParse({...withoutFlag, ...validDeliveryAddress})
        expect(result.success).toBe(true)
        if (result.success) {
            expect(result.data.sameAsPhysical).toBe(false)
        }
    })

    describe('delivery address requirement', () => {
        it('rejects a missing delivery address when sameAsPhysical is false', () => {
            const result = wholesaleApplicationSchema.safeParse({...validInput, sameAsPhysical: false})
            expect(result.success).toBe(false)
            if (!result.success) {
                const paths = result.error.issues.map((i) => i.path[0])
                expect(paths).toContain('postalAddressLine1')
                expect(paths).toContain('postalCity')
                expect(paths).toContain('postalProvince')
                expect(paths).toContain('postalPostalCode')
            }
        })

        it('rejects whitespace-only delivery fields when sameAsPhysical is false', () => {
            const result = wholesaleApplicationSchema.safeParse({
                ...validInput,
                sameAsPhysical: false,
                postalAddressLine1: '   ',
                postalCity: ' ',
                postalProvince: 'KwaZulu-Natal',
                postalPostalCode: '4001',
            })
            expect(result.success).toBe(false)
            if (!result.success) {
                const paths = result.error.issues.map((i) => i.path[0])
                expect(paths).toContain('postalAddressLine1')
                expect(paths).toContain('postalCity')
                expect(paths).not.toContain('postalProvince')
                expect(paths).not.toContain('postalPostalCode')
            }
        })

        it('accepts a filled delivery address when sameAsPhysical is false', () => {
            const result = wholesaleApplicationSchema.safeParse({
                ...validInput,
                sameAsPhysical: false,
                ...validDeliveryAddress,
            })
            expect(result.success).toBe(true)
        })

        it('requires no delivery address when sameAsPhysical is true', () => {
            const result = wholesaleApplicationSchema.safeParse(validInput)
            expect(result.success).toBe(true)
        })
    })

    it('defaults purchaseOrderRequired to false when not provided', () => {
        const result = wholesaleApplicationSchema.safeParse(validInput)
        expect(result.success).toBe(true)
        if (result.success) {
            expect(result.data.purchaseOrderRequired).toBe(false)
        }
    })

    it('accepts company section without vatNumber', () => {
        const result = wholesaleApplicationSchema.safeParse(validInput)
        expect(result.success).toBe(true)
        if (result.success) {
            expect(result.data.vatNumber).toBeUndefined()
        }
    })
})
