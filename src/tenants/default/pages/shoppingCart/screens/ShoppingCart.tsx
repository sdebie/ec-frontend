import { CartView } from '@/features/cart';
import { useCart } from '@/features/cart/hooks/useCart.ts';
import { useCartCheckout } from '@/features/cart/hooks/useCartCheckout.ts';
import { UvhTitleHero } from '@/tenants/uvh/components/UvhTitleHero.tsx';

function ShoppingCart() {
    const { placingOrder, checkout } = useCartCheckout();
    const { hasItems, itemCount } = useCart();

    return (
        <>
            <UvhTitleHero
                eyebrow="Cart"
                title="Shopping Cart"
                description={hasItems ? `${itemCount} item${itemCount === 1 ? '' : 's'} ready for checkout.` : 'Review your selected items before checkout.'}
                titleClassName="mt-1 text-xl font-bold tracking-tight text-white sm:text-2xl"
            />
            <div className="w-full bg-(--sf-bg) lg:flex lg:h-[calc(100vh-15rem)] lg:flex-col">
                <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:flex lg:min-h-0 lg:flex-1 lg:flex-col lg:px-8">
                    <CartView placingOrder={placingOrder} onCheckout={() => void checkout()} />
                </div>
            </div>
        </>
    );
}

export default ShoppingCart;
