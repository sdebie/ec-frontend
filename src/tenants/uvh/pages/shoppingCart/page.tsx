import { CartView } from '@/features/cart';
import { useCart } from '@/features/cart/hooks/useCart.ts';
import { useCartCheckout } from '@/features/cart/hooks/useCartCheckout.ts';

function UvhShoppingCart() {
    const { hasItems, itemCount } = useCart();
    const { placingOrder, checkout } = useCartCheckout();

    return (
        <div className="flex h-[calc(100vh-57px)] w-full flex-col overflow-hidden bg-(--sf-bg)">
            <div className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
                <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-(--sf-border) bg-(--sf-panel) p-4 shadow-sm sm:p-6">
                    <CartView
                        placingOrder={placingOrder}
                        onCheckout={() => void checkout()}
                    />
                </div>
            </div>
        </div>
    );
}

export default UvhShoppingCart;
