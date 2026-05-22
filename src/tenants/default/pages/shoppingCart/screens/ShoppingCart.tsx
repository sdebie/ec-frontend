import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { CartView, cartStore, useCart } from '@/features/cart';
import { SurfaceProvider } from '@/primitives/surface';
import { apiCreateOrder } from '@/services/graphql/order/OrderService.graphql.ts';
import { UvhTitleHero } from '@/tenants/uvh/components/UvhTitleHero.tsx';
import { getVariantId } from '@/utils/storefront/cart.utils.ts';

import type { OrderInput } from '@/types/order.types.ts';

function ShoppingCart() {
    const navigate = useNavigate();
    const { hasItems, items, itemCount } = useCart();
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
            <UvhTitleHero
                eyebrow="Cart"
                title="Shopping Cart"
                description={
                    hasItems
                        ? `${itemCount} item${itemCount === 1 ? '' : 's'} ready for checkout.`
                        : 'Review your selected items before checkout.'
                }
            />
            <CartView placingOrder={placingOrder} onCheckout={() => void checkout()} />
        </SurfaceProvider>
    );
}

export default ShoppingCart;