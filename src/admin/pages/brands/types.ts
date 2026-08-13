/**
 * Wire shape of one row in the paginated admin brand list (`GetBrands`).
 * Hand-maintained mirror of the backend DTO selection — drift is guarded by
 * the SDL snapshot + schemaContract.test.ts, never by this file alone.
 */
export interface BrandListItem {
    id: string
    name: string
    slug: string
    description: string | null
    logoUrl: string | null
}

/**
 * Wire shape of a single brand fetched for the edit screen (`GetBrand`).
 * The detail query currently selects exactly the list's fields — aliased
 * rather than redeclared so the two cannot drift silently. If the detail
 * selection ever grows beyond the list, give it its own interface.
 */
export type BrandDetail = BrandListItem

/**
 * Payload for the `createBrand` mutation's `BrandDtoInput`.
 */
export interface CreateBrandPayload {
    name: string
    slug: string
    description?: string
    logoUrl?: string
}

/**
 * Payload for the `updateBrand` mutation — both mutations take the same
 * full `BrandDtoInput`, so this is the update payload under its own name.
 */
export type UpdateBrandPayload = CreateBrandPayload
