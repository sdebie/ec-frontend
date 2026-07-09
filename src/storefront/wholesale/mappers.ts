import type { WholesaleApplicationFormValues } from './wholesaleApplicationSchema'
import type { WholesaleCustomerDtoInput } from './useWholesaleApplicationSubmit'

export function toDto(values: WholesaleApplicationFormValues): WholesaleCustomerDtoInput {
  const postal = values.sameAsPhysical
    ? {
        postalAddressLine1: values.physicalAddressLine1,
        postalAddressLine2: values.physicalAddressLine2 ?? '',
        postalSuburb: values.physicalSuburb,
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
    email: values.email,
    firstName: values.firstName,
    lastName: values.lastName,
    phone: values.phone,
    companyName: values.companyName,
    vatNumber: values.vatNumber ?? '',
    regNumber: values.regNumber,
    notes: values.notes ?? '',
    status: 'PENDING',
    physicalAddressLine1: values.physicalAddressLine1,
    physicalAddressLine2: values.physicalAddressLine2 ?? '',
    physicalSuburb: values.physicalSuburb,
    physicalCity: values.physicalCity,
    physicalProvince: values.physicalProvince,
    physicalPostalCode: values.physicalPostalCode,
    ...postal,
  }
}
