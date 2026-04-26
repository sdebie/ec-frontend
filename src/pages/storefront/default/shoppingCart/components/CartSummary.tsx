// features/cart/components/CartSummary.tsx
import React from 'react';
import { currency } from '@/utils/storefront/cart.utils.ts';
import { SfButton } from '@/components/storefront';

type CartSummaryProps = {
    subtotal: number;
    hasItems: boolean;
    placingOrder: boolean;
    onCheckout: () => void;
    onContinueShopping: () => void;
    onClearCart: () => void;
};

const CartSummary: React.FC<CartSummaryProps> = ({
                                                     subtotal,
                                                     hasItems,
                                                     placingOrder,
                                                     onCheckout,
                                                     onContinueShopping,
                                                     onClearCart,
                                                 }) => {
    return (
        <section
            aria-labelledby="summary-heading"
            className="mt-16 rounded-lg bg-(--sf-panel) px-4 py-6 sm:p-6 lg:sticky lg:top-8 lg:col-span-5 lg:mt-0 lg:p-8"
        >
            <h2 id="summary-heading" className="text-lg font-medium text-(--sf-text)">
                Order summary
            </h2>

            <dl className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                    <dt className="text-sm text-(--sf-muted-text)">Subtotal</dt>
                    <dd className="text-sm font-medium text-(--sf-text)">
                        {currency(subtotal)}
                    </dd>
                </div>

                <div className="flex items-center justify-between border-t border-(--sf-border) pt-4">
                    <dt className="text-sm text-(--sf-muted-text)">Shipping estimate</dt>
                    <dd className="text-sm font-medium text-(--sf-text)">
                        Calculated at checkout
                    </dd>
                </div>

                <div className="flex items-center justify-between border-t border-(--sf-border) pt-4">
                    <dt className="text-sm text-(--sf-muted-text)">Tax estimate</dt>
                    <dd className="text-sm font-medium text-(--sf-text)">
                        Calculated at checkout
                    </dd>
                </div>

                <div className="flex items-center justify-between border-t border-(--sf-border) pt-4">
                    <dt className="text-base font-medium text-(--sf-text)">Order total</dt>
                    <dd className="text-base font-medium text-(--sf-text)">
                        {currency(subtotal)}
                    </dd>
                </div>
            </dl>

            <div className="mt-6 space-y-3">
                <SfButton
                    type="button"
                    className="w-full rounded-md px-4 py-3 text-base font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-(--sf-accent) focus:ring-offset-2 focus:ring-offset-(--sf-panel)"
                    disabled={!hasItems || placingOrder}
                    onClick={onCheckout}
                >
                    {placingOrder ? 'Placing order…' : 'Checkout'}
                </SfButton>

                <button
                    type="button"
                    className="w-full rounded-md bg-(--sf-bg) px-4 py-3 text-sm font-medium text-(--sf-text) ring-1 ring-(--sf-border) ring-inset hover:opacity-95"
                    onClick={onContinueShopping}
                >
                    Continue Shopping
                </button>

                <button
                    type="button"
                    className="w-full rounded-md border border-(--sf-error) bg-(--sf-panel) px-4 py-3 text-sm font-medium text-(--sf-error) hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    onClick={onClearCart}
                    disabled={!hasItems}
                    title="Clears all items and starts a fresh cart session"
                >
                    Clear Cart & New Session
                </button>
            </div>
        </section>
    );
};

export default CartSummary;