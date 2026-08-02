/**
 * View types for the cart feature. Kept at the feature root (not beside a hook)
 * per the feature-folder convention, so components and mappers can consume them
 * without importing a data hook.
 */

/**
 * A cart line ready to render: the persisted line item joined with what the
 * catalogue currently says about that variant. Every availability question a row
 * or the summary can ask is answered here, once, by `toCartRows`.
 */
export interface CartRow {
    variantId: string
    /** From the persisted cart line — `variantsByIds` cannot return the product. */
    productName: string
    variantLabel: string
    quantity: number
    sku: string | null
    /** Already through `pickFeaturedImage` → `resolveImageUrl`; ready for `src`. */
    imageUrl: string | null
    /** Backend-selected display price for this shopper's tier, ex VAT. */
    unitPrice: number | null
    lineTotal: number | null
    /** Null means the catalogue does not know — never treated as "none left". */
    stockQuantity: number | null
    /** The variant is gone or no longer ACTIVE: it can never be ordered as-is. */
    isUnavailable: boolean
    /** The checkout 422 named this variant specifically. */
    isCheckoutFlagged: boolean
    /** Known to have no stock (stockQuantity === 0). */
    isOutOfStock: boolean
    /** Quantity is above the known stock — the server rejects the whole order. */
    exceedsStock: boolean
    /** Nothing about this row blocks checkout. */
    isOrderable: boolean
}
