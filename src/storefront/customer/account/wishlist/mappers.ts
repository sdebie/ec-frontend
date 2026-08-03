import type {HydratedWishlistItem} from './types'

/**
 * The product shape expected by ProductCard's `product` prop.
 * Derived from ProductCard.tsx's ProductCardProps['product'].
 */
export interface ProductCardProduct {
    id: string
    name: string
    slug: string
    images: Array<{ imageUrl: string; featured: boolean; sortOrder: number }>
    retailPrice: { price: number | null } | null
    wholesalePrice: { price: number | null } | null
    retailSalePrice: { price: number | null } | null
    wholesaleSalePrice: { price: number | null } | null
    sku: string | null
    inStock: boolean | null
}

/**
 * Adapts a HydratedWishlistItem into the product shape consumed by ProductCard.
 *
 * Only called for available items (productActive !== false).
 *
 * Mapping rules:
 * - imagePath → single-element images array (pickFeaturedImage → resolveImageUrl applies downstream)
 * - Sale tiers gated on `active === true`; inactive sale tiers → null
 * - Regular prices pass through unchanged
 * - sku passes through
 * - inStock defaults to null when absent
 */
export function toWishlistCardProduct(item: HydratedWishlistItem): ProductCardProduct {
    return {
        id: item.productId,
        name: item.productName,
        slug: item.productSlug,
        images: item.imagePath ? [{imageUrl: item.imagePath, featured: true, sortOrder: 0}] : [],
        retailPrice: item.retailPrice,
        wholesalePrice: item.wholesalePrice,
        retailSalePrice: item.retailSalePrice?.active ? item.retailSalePrice : null,
        wholesaleSalePrice: item.wholesaleSalePrice?.active ? item.wholesaleSalePrice : null,
        sku: item.sku,
        inStock: item.inStock ?? null,
    }
}
