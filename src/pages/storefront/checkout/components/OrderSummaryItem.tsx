import React from 'react';
import type {OrderItemData as OrderItemsData} from '@/types/order.types.ts';
import {asVariant} from '@/types/order.types.ts';
import {formatCurrency, parseAttributesJson} from './helpers.ts';
import {IMAGE_THUMBNAIL_URL} from "@/constants/api.constant.ts";

type Props = {
    item: OrderItemsData;
    index: number;
};

const OrderSummaryItem: React.FC<Props> = ({item, index}) => {

    const quantity = Number(item.quantity || 0);
    const unitPrice = Number(item.unitPrice || 0);
    const lineTotal = quantity * unitPrice;
    const variant = asVariant(item.variant);
    const attrs = parseAttributesJson(variant?.attributesJson);
    const imageUrl = variant?.images?.[0]?.imageUrl;

    return (
        <li className="flex gap-4 border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md border border-gray-200 bg-white">
                {imageUrl ? (

                    <img src={`${IMAGE_THUMBNAIL_URL}${imageUrl}`} alt={variant?.product?.name || 'Product'}
                         className="h-full w-full object-cover"/>
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">Item</div>
                )}
            </div>

            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">{variant?.product?.name || `Product ${index + 1}`}</p>
                <p className="mt-1 text-xs text-gray-500">Qty {quantity} x {formatCurrency(unitPrice)}</p>
                {attrs.length > 0 && (
                    <dl className="mt-2 space-y-1 text-xs text-gray-500">
                        {attrs.map((entry) => (
                            <div key={`${entry.label}-${entry.value}`} className="flex gap-1">
                                <dt className="font-medium text-gray-600">{entry.label}:</dt>
                                <dd className="truncate">{entry.value}</dd>
                            </div>
                        ))}
                    </dl>
                )}
            </div>

            <p className="text-sm font-semibold text-gray-900">{formatCurrency(lineTotal)}</p>
        </li>
    );
};

export default OrderSummaryItem;

