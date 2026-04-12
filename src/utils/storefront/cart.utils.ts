import {OrderItemsData} from "@/pages/shop/default/cart/types.ts";

export const LS_KEY = 'ec_cart_order_items';

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
    if (typeof item?.variant?.stockQuantity === 'number') {
        return item.variant.stockQuantity > 0
            ? {label: 'In stock', inStock: true}
            : {label: 'Currently unavailable', inStock: false};
    }

    return {label: 'Ready to checkout', inStock: true};
};

export const getVariantId = (item: OrderItemsData) => {
    const variant = item.variant as string | { id?: string } | undefined;
    return typeof variant === 'string' ? variant : variant?.id;
};