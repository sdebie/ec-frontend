import {CustomerType} from '@/constants/enums/CustomerType';
import type {ProductShoppingListItem} from '@/types/shared/ProductTypes';

export type VariantPriceRow = {
    priceType?: string | null;
    price?: number | null;
    /** Present on product-detail queries (`isActive: active`). */
    isActive?: boolean | null;
    /** Present on `VARIANTS_BY_IDS` (`active` field). */
    active?: boolean | null;
};

/**
 * Matches GraphQL `variants.prices` / catalog variant price rows.
 * Prefers active flag when present; otherwise first matching type.
 */
function rowIsActive(row: VariantPriceRow): boolean {
    return row.isActive === true || row.active === true;
}

export function pickVariantPriceByType(
    prices: VariantPriceRow[] | null | undefined,
    priceType: string,
): number | null {
    if (!prices || prices.length === 0) return null;
    const active = prices.find((row) => row.priceType === priceType && rowIsActive(row));
    if (active?.price != null) return active.price;
    const fallback = prices.find((row) => row.priceType === priceType);
    return fallback?.price ?? null;
}

export function getDisplayPrice(
    product: ProductShoppingListItem,
    customerType: CustomerType,
): { price: number; originalPrice?: number } {
    if (customerType === CustomerType.WHOLESALER) {
        const wholesale = product.wholesalePrice?.price ?? 0;
        const wholesaleSale = product.wholesaleSalePrice?.price;
        if (wholesaleSale != null && wholesaleSale > 0 && wholesale > wholesaleSale) {
            return {price: wholesaleSale, originalPrice: wholesale};
        }
        return {price: wholesale};
    }

    const retail = product.retailPrice?.price ?? 0;
    const retailSale = product.retailSalePrice?.price;
    if (retailSale != null && retailSale > 0 && retail > retailSale) {
        return {price: retailSale, originalPrice: retail};
    }
    return {price: retail};
}

export type VariantTierNumbers = {
    retailPrice: number;
    retailSalePrice: number | null;
    wholesalePrice: number;
    wholesaleSalePrice: number | null;
};

export function getDisplayPriceForVariantTiers(
    tiers: VariantTierNumbers,
    customerType: CustomerType,
): { price: number; originalPrice?: number } {
    const pseudo: ProductShoppingListItem = {
        id: 'variant-tier',
        name: '',
        retailPrice: {id: '', price: tiers.retailPrice},
        retailSalePrice:
            tiers.retailSalePrice != null ? {id: '', price: tiers.retailSalePrice} : null,
        wholesalePrice: {id: '', price: tiers.wholesalePrice},
        wholesaleSalePrice:
            tiers.wholesaleSalePrice != null ? {id: '', price: tiers.wholesaleSalePrice} : null,
    };
    return getDisplayPrice(pseudo, customerType);
}

export function getDisplayPriceFromVariantPriceRows(
    prices: VariantPriceRow[] | null | undefined,
    customerType: CustomerType,
): { price: number; originalPrice?: number } {
    const retail = pickVariantPriceByType(prices, 'RETAIL_PRICE') ?? 0;
    const retailSale = pickVariantPriceByType(prices, 'RETAIL_SALE_PRICE');
    const wholesale = pickVariantPriceByType(prices, 'WHOLESALE_PRICE') ?? 0;
    const wholesaleSale = pickVariantPriceByType(prices, 'WHOLESALE_SALE_PRICE');

    return getDisplayPriceForVariantTiers(
        {
            retailPrice: retail,
            retailSalePrice: retailSale,
            wholesalePrice: wholesale,
            wholesaleSalePrice: wholesaleSale,
        },
        customerType,
    );
}
