import { useNavigate } from 'react-router-dom';

import CartItemList from '@/features/cart/CartItemList.tsx';
import CartSummary from '@/features/cart/CartSummary.tsx';
import EmptyCart from '@/features/cart/EmptyCart.tsx';
import { useCart } from '@/features/cart/hooks/useCart.ts';

type CartViewProps = {
    placingOrder: boolean;
    onCheckout: () => void;
};

export default function CartView({ placingOrder, onCheckout }: CartViewProps) {
    const navigate = useNavigate();
    const { items, hasItems, subtotal, updateQuantity, removeItem, clearCart } = useCart();

    if (!hasItems) {
        return <EmptyCart onBrowse={() => navigate('/products')} />;
    }

    return (
        <form
            className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:h-[calc(100vh-14rem)]"
            onSubmit={(event) => {
                event.preventDefault();
                onCheckout();
            }}
        >
            <div className="lg:col-span-7 lg:h-full lg:overflow-y-auto lg:pr-2">
                <CartItemList
                    items={items}
                    onQuantityChange={updateQuantity}
                    onRemove={removeItem}
                />
            </div>

            <CartSummary
                subtotal={subtotal}
                hasItems={hasItems}
                placingOrder={placingOrder}
                onCheckout={onCheckout}
                onContinueShopping={() => navigate('/products')}
                onClearCart={clearCart}
            />
        </form>
    );
}
