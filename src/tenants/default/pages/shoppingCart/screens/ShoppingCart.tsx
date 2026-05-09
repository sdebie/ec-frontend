import { useState } from 'react';
import { useNavigate } from 'react-router-dom';


import { CartView, cartStore, useCart } from '@/features/cart';
import { SurfaceProvider } from '@/primitives/surface';
import { apiCreateOrder } from '@/services/graphql/order/OrderService.graphql.ts';
import { getVariantId } from '@/utils/storefront/cart.utils.ts';

import type { OrderInput } from '@/types/order.types.ts';


function ShoppingCart() {
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

    return (
        <SurfaceProvider surface="storefront">
            <CartView placingOrder={placingOrder} onCheckout={() => void checkout()} />
        </SurfaceProvider>
    );
}

export default ShoppingCart;