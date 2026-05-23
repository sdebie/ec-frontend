import { CartView } from '@/features/cart';
import { useCart } from '@/features/cart/hooks/useCart.ts';
import { useCartCheckout } from '@/features/cart/hooks/useCartCheckout.ts';
import { SurfaceProvider } from '@/primitives/surface';
import { UvhTitleHero } from '@/tenants/uvh/components/UvhTitleHero.tsx';

function UvhShoppingCart() {
    const { hasItems, itemCount } = useCart();
    const { placingOrder, checkout } = useCartCheckout();

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
            <main className="w-full bg-(--sf-bg)">
                <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                    <div className="rounded-2xl border border-(--sf-border) bg-(--sf-panel) p-5 shadow-sm sm:p-8">
                        <CartView placingOrder={placingOrder} onCheckout={() => void checkout()} />
                    </div>
                </section>
            </main>
        </SurfaceProvider>
    );
}

export default UvhShoppingCart;
