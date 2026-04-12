import React from 'react';
import {ShoppingBag} from 'lucide-react';
import type {OrderData} from '@/pages/shop/default/cart/types.ts';
import type {ShippingMethod} from '@/services/StoreSettings.ts';
import {formatCurrency} from './helpers.ts';
import OrderSummaryItem from './OrderSummaryItem.tsx';

type Props = {
    order: OrderData | null;
    loading: boolean;
    error: string | null;
    itemsTotal: number;
    selectedShipping: ShippingMethod | null;
    shippingFee: number;
    grandTotal: number;
};

const OrderSummary: React.FC<Props> = ({
                                           order,
                                           loading,
                                           error,
                                           itemsTotal,
                                           selectedShipping,
                                           shippingFee,
                                           grandTotal,
                                       }) => {
    return (
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-gray-700"/>
                <h2 className="text-base font-semibold text-gray-900">Order summary</h2>
                <span className="ml-auto text-xs text-gray-500">#{order?.id || '-'}</span>
            </div>

            {loading ? (
                <p className="text-sm text-gray-600">Loading order details...</p>
            ) : error ? (
                <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>
            ) : (
                <>
                    <ul className="space-y-4">
                        {(order?.items || []).map((item, index) => (
                            <OrderSummaryItem key={`${item?.variant?.id || 'item'}-${index}`} item={item}
                                              index={index}/>
                        ))}
                    </ul>

                    <dl className="mt-5 space-y-2 border-t border-gray-100 pt-4 text-sm">
                        <div className="flex items-center justify-between">
                            <dt className="text-gray-600">Subtotal</dt>
                            <dd className="font-medium text-gray-900">{formatCurrency(itemsTotal)}</dd>
                        </div>
                        <div className="flex items-center justify-between">
                            <dt className="text-gray-600">
                                Shipping{selectedShipping?.name ? ` (${selectedShipping.name})` : ''}
                            </dt>
                            <dd className="font-medium text-gray-900">{formatCurrency(shippingFee)}</dd>
                        </div>
                        <div
                            className="flex items-center justify-between border-t border-gray-200 pt-3 text-base font-semibold">
                            <dt className="text-gray-900">Total</dt>
                            <dd className="text-gray-900">{formatCurrency(grandTotal)}</dd>
                        </div>
                    </dl>
                </>
            )}
        </section>
    );
};

export default OrderSummary;

