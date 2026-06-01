import {ShoppingBag} from 'lucide-react';
import React from 'react';
import OrderSummaryItem from '@/features/checkout/sections/OrderSummaryItem.tsx';
import {formatCurrency} from '@/features/checkout/utils/checkout.helpers.ts';
import {Card} from '@/primitives/card';
import type {OrderData} from '@/types/order.types.ts';
import {asVariant} from '@/types/order.types.ts';
import type {ShippingMethod} from '@/services/StoreSettings.ts';

type Props = {
    order: OrderData | null;
    loading: boolean;
    error: string | null;
    itemsTotal: number;
    selectedShipping: ShippingMethod | null;
    shippingFee: number;
    grandTotal: number;
};

const OrderSummarySection: React.FC<Props> = ({
                                                  order,
                                                  loading,
                                                  error,
                                                  itemsTotal,
                                                  selectedShipping,
                                                  shippingFee,
                                                  grandTotal,
                                              }) => {
    return (
        <Card as="section" elevation="sm" padded={false} className="p-6">
            <div className="mb-4 flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-(--sf-muted-text)"/>
                <h2 className="text-base font-semibold text-(--sf-text)">Order Summary</h2>
                <span className="ml-auto text-xs text-(--sf-muted-text)">#{order?.id || '-'}</span>
            </div>

            {loading ? (
                <p className="text-sm text-(--sf-muted-text)">Loading order details...</p>
            ) : error ? (
                <p className="rounded-lg border border-(--sf-error) bg-(--sf-bg) p-3 text-sm text-(--sf-error)">{error}</p>
            ) : (
                <>
                    <ul className="space-y-4">
                        {(order?.items || []).map((item, index) => (
                            <OrderSummaryItem
                                key={`${asVariant(item?.variant)?.id || 'item'}-${index}`}
                                item={item}
                                index={index}
                            />
                        ))}
                    </ul>

                    <dl className="mt-5 space-y-2 border-t border-(--sf-border) pt-4 text-sm">
                        <div className="flex items-center justify-between">
                            <dt className="text-(--sf-muted-text)">Subtotal</dt>
                            <dd className="font-medium text-(--sf-text)">{formatCurrency(itemsTotal)}</dd>
                        </div>
                        <div className="flex items-center justify-between">
                            <dt className="text-(--sf-muted-text)">
                                Shipping{selectedShipping?.name ? ` (${selectedShipping.name})` : ''}
                            </dt>
                            <dd className="font-medium text-(--sf-text)">{formatCurrency(shippingFee)}</dd>
                        </div>
                        <div
                            className="flex items-center justify-between border-t border-(--sf-border) pt-3 text-base font-semibold">
                            <dt className="text-(--sf-text)">Total</dt>
                            <dd className="text-(--sf-text)">{formatCurrency(grandTotal)}</dd>
                        </div>
                    </dl>
                </>
            )}
        </Card>
    );
};

export default OrderSummarySection;
