import {useNavigate} from 'react-router-dom';
import {useMutation} from '@tanstack/react-query';
import {cartStore} from '@/features/cart/cartStore.ts';
import {useCart} from '@/features/cart/hooks/useCart.ts';
import {apiCreateOrder} from '@/services/graphql/order/OrderService.graphql.ts';
import {getVariantId} from '@/utils/storefront/cart.utils.ts';
import type {OrderInput} from '@/types/order.types.ts';

export function useCartCheckout() {
    const navigate = useNavigate();
    const {hasItems, items} = useCart();

    const mutation = useMutation({
        mutationFn: async () => {
            const sessionId = cartStore.getOrderSessionId() ?? undefined;
            const payload: OrderInput = {
                sessionId,
                items: items.map((item) => ({
                    unitPrice: item.unitPrice,
                    quantity: item.quantity,
                    variant: getVariantId(item),
                })),
            };
            return apiCreateOrder(payload, sessionId);
        },
        onSuccess: () => navigate('/checkout'),
        onError: (error) => console.error('Failed to create order before checkout', error),
    });

    const checkout = () => {
        if (!hasItems || mutation.isPending) return;
        mutation.mutate();
    };

    return {placingOrder: mutation.isPending, checkout};
}
