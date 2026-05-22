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
    const { items, hasItems, itemCount, subtotal, updateQuantity, removeItem, clearCart } = useCart();

    return (
        <main className="w-full bg-(--sf-bg)">
            <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                {!hasItems ? (
                    <EmptyCart onBrowse={() => navigate('/products')} />
                ) : (
                    <div className="rounded-2xl border border-(--sf-border) bg-(--sf-panel) p-5 shadow-sm sm:p-8">
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
                    </div>
                )}
            </section>
        </main>
    );
}
