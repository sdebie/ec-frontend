import { Button } from '@/primitives/button';
import { currency } from '@/utils/storefront/cart.utils.ts';

type CartSummaryProps = {
    subtotal: number;
    hasItems: boolean;
    placingOrder: boolean;
    onCheckout: () => void;
    onContinueShopping: () => void;
    onClearCart: () => void;
};

export default function CartSummary({
    subtotal,
    hasItems,
    placingOrder,
    onCheckout,
    onContinueShopping,
    onClearCart,
}: CartSummaryProps) {
    return (
        <section
            aria-labelledby="summary-heading"
            className="mt-8 rounded-2xl border border-(--sf-border) bg-(--sf-bg) p-6 lg:col-span-5 lg:mt-0 lg:self-start"
        >
            <h2 id="summary-heading" className="text-base font-semibold text-(--sf-text)">
                Order summary
            </h2>
            <div className="mt-3 h-0.5 w-8 bg-(--sf-accent)" aria-hidden />

            <dl className="mt-5 space-y-3">
                <div className="flex items-center justify-between">
                    <dt className="text-sm text-(--sf-muted-text)">Subtotal</dt>
                    <dd className="text-sm font-medium text-(--sf-text)">{currency(subtotal)}</dd>
                </div>

                <div className="flex items-center justify-between border-t border-(--sf-border) pt-3">
                    <dt className="text-sm text-(--sf-muted-text)">Shipping estimate</dt>
                    <dd className="text-sm font-medium text-(--sf-text)">Calculated at checkout</dd>
                </div>

                <div className="flex items-center justify-between border-t border-(--sf-border) pt-3">
                    <dt className="text-sm text-(--sf-muted-text)">Tax estimate</dt>
                    <dd className="text-sm font-medium text-(--sf-text)">Calculated at checkout</dd>
                </div>

                <div className="flex items-center justify-between border-t border-(--sf-border) pt-3">
                    <dt className="text-sm font-semibold text-(--sf-text)">Order total</dt>
                    <dd className="text-sm font-semibold text-(--sf-text)">{currency(subtotal)}</dd>
                </div>
            </dl>

            <div className="mt-6 space-y-3">
                <Button
                    type="button"
                    fullWidth
                    size="lg"
                    disabled={!hasItems || placingOrder}
                    loading={placingOrder}
                    onClick={onCheckout}
                >
                    {placingOrder ? 'Placing order…' : 'Checkout'}
                </Button>

                <Button
                    type="button"
                    variant="outline"
                    fullWidth
                    size="lg"
                    onClick={onContinueShopping}
                >
                    Continue Shopping
                </Button>

                <Button
                    type="button"
                    variant="outline"
                    fullWidth
                    size="lg"
                    disabled={!hasItems}
                    className="border-(--sf-error) text-(--sf-error) hover:bg-(--sf-error)/5"
                    onClick={onClearCart}
                >
                    Clear Cart & New Session
                </Button>
            </div>
        </section>
    );
}
