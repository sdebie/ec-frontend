import { CartView } from '@/features/cart';
import { useCartCheckout } from '@/features/cart/hooks/useCartCheckout.ts';
import { SurfaceProvider } from '@/primitives/surface';

function ShoppingCart() {
    const { placingOrder, checkout } = useCartCheckout();

    return (
        <SurfaceProvider surface="storefront">
            <main className="w-full bg-(--sf-bg)">
                <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                    <CartView placingOrder={placingOrder} onCheckout={() => void checkout()} />
                </section>
            </main>
        </SurfaceProvider>
    );
}

export default ShoppingCart;
