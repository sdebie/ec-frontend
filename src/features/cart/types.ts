import type { OrderItemData } from '@/types/order.types.ts';

export type CartItem = OrderItemData;

export type CartCheckoutItemInput = {
    quantity: number;
    unitPrice: number;
    variant: string;
};
