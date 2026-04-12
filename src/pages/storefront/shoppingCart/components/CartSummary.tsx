// features/cart/components/CartSummary.tsx
import React from 'react';
import { currency } from '@/utils/storefront/cart.utils.ts';

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
            className="mt-16 rounded-lg bg-gray-50 px-4 py-6 sm:p-6 lg:sticky lg:top-8 lg:col-span-5 lg:mt-0 lg:p-8"
        >
            <h2 id="summary-heading" className="text-lg font-medium text-gray-900">
                Order summary
            </h2>

            <dl className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                    <dt className="text-sm text-gray-600">Subtotal</dt>
                    <dd className="text-sm font-medium text-gray-900">
                        {currency(subtotal)}
                    </dd>
                </div>

                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                    <dt className="text-sm text-gray-600">Shipping estimate</dt>
                    <dd className="text-sm font-medium text-gray-900">
                        Calculated at checkout
                    </dd>
                </div>

                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                    <dt className="text-sm text-gray-600">Tax estimate</dt>
                    <dd className="text-sm font-medium text-gray-900">
                        Calculated at checkout
                    </dd>
                </div>

                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                    <dt className="text-base font-medium text-gray-900">Order total</dt>
                    <dd className="text-base font-medium text-gray-900">
                        {currency(subtotal)}
                    </dd>
                </div>
            </dl>

            <div className="mt-6 space-y-3">
                <button
                    type="button"
                    className="w-full rounded-md border border-transparent bg-indigo-600 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={!hasItems || placingOrder}
                    onClick={onCheckout}
                >
                    {placingOrder ? 'Placing order…' : 'Checkout'}
                </button>

                <button
                    type="button"
                    className="w-full rounded-md bg-white px-4 py-3 text-sm font-medium text-gray-900 ring-1 ring-gray-300 ring-inset hover:bg-gray-50"
                    onClick={onContinueShopping}
                >
                    Continue Shopping
                </button>

                <button
                    type="button"
                    className="w-full rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
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