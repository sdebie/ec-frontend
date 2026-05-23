import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { cartStore } from '@/features/cart/cartStore.ts';
import { useCart } from '@/features/cart/hooks/useCart.ts';
import { apiCreateOrder } from '@/services/graphql/order/OrderService.graphql.ts';
import { getVariantId } from '@/utils/storefront/cart.utils.ts';

import type { OrderInput } from '@/types/order.types.ts';

export function useCartCheckout() {
    const navigate = useNavigate();
    const { hasItems, items } = useCart();
    const [placingOrder, setPlacingOrder] = useState(false);

    const checkout = async () => {
        if (!hasItems || placingOrder) return;
        setPlacingOrder(true);
        try {
            const sessionId = cartStore.getOrderSessionId() ?? undefined;
            const payload: OrderInput = {
                sessionId,
                items: items.map((item) => ({
                    unitPrice: item.unitPrice,
                    quantity: item.quantity,
                    variant: getVariantId(item),
                })),
            };
            await apiCreateOrder(payload, sessionId);
            navigate('/checkout');
        } catch (error) {
            console.error('Failed to create order before checkout', error);
        } finally {
            setPlacingOrder(false);
        }
    };

    return { placingOrder, checkout };
}
