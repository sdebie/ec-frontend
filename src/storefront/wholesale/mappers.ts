import type {WholesaleApplicationFormValues} from './wholesaleApplicationSchema'
import type {WholesaleCustomerDtoInput} from './types'

/** Convert an empty or undefined string to null for nullable DTO fields. */
function emptyToNull(value: string | undefined): string | null {
    return value?.trim() ? value.trim() : null
}

export function toDto(values: WholesaleApplicationFormValues): WholesaleCustomerDtoInput {
    const postal = values.sameAsPhysical
        ? {
            postalAddressLine1: values.physicalAddressLine1,
            postalAddressLine2: values.physicalAddressLine2 ?? '',
            postalSuburb: values.physicalSuburb ?? '',
            postalCity: values.physicalCity,
            postalProvince: values.physicalProvince,
            postalPostalCode: values.physicalPostalCode,
        }
        : {
            postalAddressLine1: values.postalAddressLine1 ?? '',
            postalAddressLine2: values.postalAddressLine2 ?? '',
            postalSuburb: values.postalSuburb ?? '',
            postalCity: values.postalCity ?? '',
            postalProvince: values.postalProvince ?? '',
            postalPostalCode: values.postalPostalCode ?? '',
        }

    return {
        applicantEmail: values.applicantEmail,
        email: emptyToNull(values.accountEmail),
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone,
        companyName: values.companyName,
        tradingName: emptyToNull(values.tradingName),
        companyPhone: emptyToNull(values.companyPhone),
        companyEmail: emptyToNull(values.companyEmail),
        vatNumber: values.vatNumber ?? '',
        regNumber: values.regNumber ?? '',
        financeContactName: emptyToNull(values.financeContactName),
        financeContactEmail: emptyToNull(values.financeContactEmail),
        financeContactPhone: emptyToNull(values.financeContactPhone),
        purchaseOrderRequired: values.purchaseOrderRequired,
        notes: values.notes ?? '',
        status: 'PENDING',
        physicalAddressLine1: values.physicalAddressLine1,
        physicalAddressLine2: values.physicalAddressLine2 ?? '',
        physicalSuburb: values.physicalSuburb ?? '',
        physicalCity: values.physicalCity,
        physicalProvince: values.physicalProvince,
        physicalPostalCode: values.physicalPostalCode,
        ...postal,
    }
}
