import { Button } from '@/primitives/button';
import { UvhSectionHeading } from '@/tenants/uvh/components/UvhSectionHeading';
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
            className="flex flex-col rounded-2xl border border-(--sf-border) bg-(--sf-panel) p-6 shadow-sm lg:col-span-5 lg:self-start lg:sticky lg:top-4"
        >
            <UvhSectionHeading id="summary-heading">Order Summary</UvhSectionHeading>

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

                <div className="flex items-center justify-between rounded-xl bg-(--sf-accent)/5 px-4 py-3 border-t border-(--sf-border) mt-4">
                    <dt className="text-base font-bold text-(--sf-text)">Order total</dt>
                    <dd className="text-base font-bold text-(--sf-accent)">{currency(subtotal)}</dd>
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
                    size="md"
                    onClick={onContinueShopping}
                >
                    Continue Shopping
                </Button>
            </div>

            <div className="mt-4 border-t border-(--sf-border) pt-4">
                <button
                    type="button"
                    disabled={!hasItems}
                    className="w-full text-center text-xs text-(--sf-muted-text) hover:text-(--sf-error) disabled:opacity-40 transition-colors"
                    onClick={onClearCart}
                >
                    Clear cart &amp; start new session
                </button>
            </div>
        </section>
    );
}
