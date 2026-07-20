import type {StorefrontMeResponse} from '@/storefront/customer/account/types'

export const customerProfileFixture: StorefrontMeResponse = {
    email: 'dev@example.com',
    shopperType: 'RETAILER',
    firstName: 'Dev',
    lastName: 'User',
    phone: '0800 000 000',
    hasPassword: true,
    physicalAddress: {
        line1: '1 Dev Street',
        line2: null,
        suburb: 'Techpark',
        city: 'Cape Town',
        province: 'Western Cape',
        postalCode: '8001',
    },
    postalAddress: null,
}
