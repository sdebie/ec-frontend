/**
 * Wire types for the wishlist feature — the shapes the REST hydrate endpoint
 * returns. Kept here (not beside a hook) per the feature-folder convention, so
 * components and mappers can consume them without importing a data hook.
 */
export interface HydratedWishlistItem {
    variantId: string
    variantLabel: string
    sku: string
    productId: string
    productName: string
    productSlug: string
    imagePath: string | null
    retailPrice: { price: number | null } | null
    wholesalePrice: { price: number | null } | null
    retailSalePrice: { price: number | null; active: boolean } | null
    wholesaleSalePrice: { price: number | null; active: boolean } | null
    inStock: boolean | null
    productActive: boolean | null
}

/**
 * What the page is currently asking the user to confirm. A discriminated union
 * so each dialog carries exactly the data its copy needs — `null` means closed.
 */
export type DialogRequest =
    | null
    | { kind: 'moveItem'; item: HydratedWishlistItem; quantity: number }
    | { kind: 'moveAll' }
    | { kind: 'removeItem'; item: HydratedWishlistItem }
    | { kind: 'removeAll' }
    | { kind: 'removeUnavailable' }
