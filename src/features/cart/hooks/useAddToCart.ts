import {useState} from 'react';
import {cartStore} from '@/features/cart/cartStore.ts';
import type {CartCheckoutItemInput} from '@/features/cart/types.ts';
import type {OrderData} from '@/types/order.types.ts';

type AddToCartPayload = {
    items: CartCheckoutItemInput[];
};

export function useAddToCart() {
    const [createLoading, setCreateLoading] = useState(false);
    const [createError, setCreateError] = useState<Error | null>(null);

    async function addToCart(orderDetail: AddToCartPayload): Promise<OrderData> {
        setCreateLoading(true);
        setCreateError(null);

        try {
            return cartStore.mergeItems({items: orderDetail.items} as OrderData);
        } catch (error) {
            setCreateError(error as Error);
            throw error;
        } finally {
            setCreateLoading(false);
        }
    }

    return {createOrder: addToCart, createLoading, createError};
}
