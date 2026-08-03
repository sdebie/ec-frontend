/**
 * Wire shape of the `createWholesaleApplication` GraphQL input.
 * Hand-maintained mirror of the backend DTO — drift is guarded by the SDL
 * snapshot + schemaContract.test.ts, never by this file alone.
 */
export interface WholesaleCustomerDtoInput {
    applicantEmail: string
    email: string | null
    firstName: string
    lastName: string
    phone: string
    companyName: string
    tradingName: string | null
    companyPhone: string | null
    companyEmail: string | null
    vatNumber: string
    regNumber: string
    financeContactName: string | null
    financeContactEmail: string | null
    financeContactPhone: string | null
    purchaseOrderRequired: boolean
    notes: string
    status: string
    physicalAddressLine1: string
    physicalAddressLine2: string
    physicalSuburb: string
    physicalCity: string
    physicalProvince: string
    physicalPostalCode: string
    postalAddressLine1: string
    postalAddressLine2: string
    postalSuburb: string
    postalCity: string
    postalProvince: string
    postalPostalCode: string
}
