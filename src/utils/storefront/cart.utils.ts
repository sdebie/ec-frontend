import {getDisplayPriceFromVariantPriceRows} from '@/features/catalog/utils/pricing.ts';
import {OrderItemData as OrderItemsData, asVariant} from '@/types/order.types.ts';
import {getCartItemsStorageKey} from '@/utils/storefront/tenantStorageKeys';
import type { CustomerType } from '@/constants/enums/CustomerType';


export const getCartItemsKey = () => getCartItemsStorageKey();

export const currency = (val?: number | null) =>
    typeof val === 'number' ? `R ${val.toFixed(2)}` : '—';

export const getQuantityOptions = (quantity?: number | null) => {
    const safeQuantity = Math.max(1, Number(quantity || 1));
    return Array.from(
        {length: Math.max(10, safeQuantity + 4)},
        (_, index) => index + 1
    );
};

export const getAvailability = (item: OrderItemsData) => {
    const variant = asVariant(item?.variant);
    if (typeof variant?.stockQuantity === 'number') {
        return variant.stockQuantity > 0
            ? {label: 'In stock', inStock: true}
            : {label: 'Currently unavailable', inStock: false};
    }

    return {label: 'Ready to checkout', inStock: true};
};

export const getVariantId = (item: OrderItemsData) => {
    const variant = item.variant as string | { id?: string } | undefined;
    return typeof variant === 'string' ? variant : variant?.id;
};

/**
 * Cart line display unit: use enriched variant `prices` when present; otherwise persisted `unitPrice`.
 * Lives in storefront utils (not `features/cart`) so `features/cart` does not import `features/catalog`.
 */
export function getCartLineDisplayUnit(item: OrderItemsData, customerType: CustomerType): number {
    const variant = asVariant(item.variant);
    const rows = variant?.prices;
    if (rows && rows.length > 0) {
        return getDisplayPriceFromVariantPriceRows(rows, customerType).price;
    }
    return Number(item.unitPrice ?? 0);
}