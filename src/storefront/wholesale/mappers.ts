import type {WholesaleApplicationFormValues} from './wholesaleApplicationSchema'
import type {WholesaleCustomerDtoInput} from './types'

/** Convert an empty or undefined string to null for nullable DTO fields. */
function emptyToNull(value: string | undefined): string | null {
    return value?.trim() ? value.trim() : null
}

export function toDto(values: WholesaleApplicationFormValues): WholesaleCustomerDtoInput {
    const physicalAddress = {
        line1: values.physicalAddressLine1,
        line2: values.physicalAddressLine2 ?? '',
        suburb: values.physicalSuburb ?? '',
        city: values.physicalCity,
        province: values.physicalProvince,
        postalCode: values.physicalPostalCode,
    }

    const postalAddress = values.sameAsPhysical
        ? physicalAddress
        : {
            line1: values.postalAddressLine1 ?? '',
            line2: values.postalAddressLine2 ?? '',
            suburb: values.postalSuburb ?? '',
            city: values.postalCity ?? '',
            province: values.postalProvince ?? '',
            postalCode: values.postalPostalCode ?? '',
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
        physicalAddress,
        postalAddress,
    }
}
