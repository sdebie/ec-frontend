/**
 * Wire shape of one row in the paginated admin category list (`GetCategories`).
 * Hand-maintained mirror of the backend DTO selection — drift is guarded by
 * the SDL snapshot + schemaContract.test.ts, never by this file alone.
 */
export interface CategoryListItem {
    id: string
    name: string
    slug: string
    description: string | null
    imageUrl: string | null
    parent: { id: string; name: string } | null
}

/**
 * Wire shape of a single category fetched for the edit screen (`GetCategory`).
 * The detail query currently selects exactly the list's fields — aliased
 * rather than redeclared so the two cannot drift silently. If the detail
 * selection ever grows beyond the list, give it its own interface.
 */
export type CategoryDetail = CategoryListItem

/**
 * Payload for the `createCategory` mutation's `CategoryDtoInput`.
 * `parent` carries the id alone on the way in, where the read shapes above
 * also carry its name — the backend resolves the rest.
 */
export interface CreateCategoryPayload {
    name: string
    slug: string
    description?: string
    imageUrl?: string
    parent?: { id: string } | null
}

/**
 * Payload for the `updateCategory` mutation — both mutations take the same
 * full `CategoryDtoInput`, so this is the creation payload under its own name.
 */
export type UpdateCategoryPayload = CreateCategoryPayload
