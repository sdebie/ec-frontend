import type { ProductShoppingListItem } from '@/types/shared/ProductTypes.ts';

export function pickFeaturedImage(product: ProductShoppingListItem): string | undefined {
    return product.images?.find((img) => img.isFeatured)?.imageUrl ?? product.images?.[0]?.imageUrl;
}
