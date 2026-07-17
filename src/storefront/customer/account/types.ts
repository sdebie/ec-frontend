/**
 * Shared data model interfaces for the customer account portal.
 *
 * Order types (e.g. OrderStatusEvent) are hand-written alongside their hooks
 * (see useOrderDetail.ts). There is no graphql-codegen step — mirror the inline
 * `gql` selection set in the hook when adding fields (see CLAUDE.md law #8).
 */

export interface AddressDto {
  line1: string
  line2: string | null
  suburb: string | null
  city: string
  province: string
  postalCode: string
}

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
  physicalAddressLine1?: string | null
  physicalAddressLine2?: string | null
  physicalSuburb?: string | null
  physicalCity?: string | null
  physicalProvince?: string | null
  physicalPostalCode?: string | null
  postalAddressLine1?: string | null
  postalAddressLine2?: string | null
  postalSuburb?: string | null
  postalCity?: string | null
  postalProvince?: string | null
  postalPostalCode?: string | null
}

export interface UpdateProfileResponse {
  token: string
  email: string
  firstName: string
  lastName: string
  shopperType: 'GUEST' | 'RETAILER' | 'WHOLESALER'
  status: 'PENDING' | 'ACTIVE' | 'DISABLED'
}
