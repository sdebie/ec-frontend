/**
 * Shared data model interfaces for the customer account portal.
 *
 * Order types (e.g. OrderStatusEvent) are handwritten alongside their hooks
 * (see useOrderDetail.ts). There is no graphql-codegen step — mirror the inline
 * `gql` selection set in the hook when adding fields.
 */

import type { AddressDto, AddressInput } from '@/shared/types/AddressDto'

export interface StorefrontMeResponse {
    email: string
    shopperType: 'GUEST' | 'RETAILER' | 'WHOLESALER'
    firstName: string
    lastName: string
    phone: string | null
    physicalAddress: AddressDto | null
    postalAddress: AddressDto | null
    hasPassword: boolean
}

export interface WishlistResponse {
    variantIds: string[]
}

export interface ChangePasswordRequest {
    currentPassword: string
    newPassword: string
}

export interface UpdateProfileRequest {
    email: string
    firstName: string
    lastName: string
    phone?: string | null
    physicalAddress?: AddressInput | null
    postalAddress?: AddressInput | null
}

export interface UpdateProfileResponse {
    token: string
    email: string
    firstName: string
    lastName: string
    shopperType: 'GUEST' | 'RETAILER' | 'WHOLESALER'
    status: 'PENDING' | 'ACTIVE' | 'DISABLED'
}
