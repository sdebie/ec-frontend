import type { OrderItemData } from '@/types/order.types.ts';

export type CartItem = OrderItemData;

export type CartCheckoutItemInput = {
    quantity: number;
    unitPrice: number;
    variant: string;
    /** Product name captured at add-to-cart time — persisted so CartItemRow can display it without waiting for variant enrichment. */
    productName?: string;
};
