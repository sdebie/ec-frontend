import { ChevronDown, ShoppingBag, Trash2 } from 'lucide-react';
import { useMemo } from 'react';


import ProductImage from '@/components/shared/imageupload/ProductImage.tsx';
import { useCustomerType } from '@/store/customerTypeStore.ts';
import { asVariant } from '@/types/order.types.ts';
import { formatAttributes } from '@/utils/formatAttributes.ts';
import {
    currency,
    getCartLineDisplayUnit,
    getQuantityOptions,
} from '@/utils/storefront/cart.utils.ts';

import type { CartItem } from '@/features/cart/types.ts';

type CartItemRowProps = {
    item: CartItem;
    index: number;
    onQuantityChange: (index: number, quantity: number) => void;
    onRemove: (index: number) => void;
};

export default function CartItemRow({ item, index, onQuantityChange, onRemove }: CartItemRowProps) {
    const customerType = useCustomerType();
    const quantity = Math.max(1, Number(item.quantity || 1));
    const quantityOptions = getQuantityOptions(quantity);
    const displayUnit = getCartLineDisplayUnit(item, customerType);
    const lineTotal = displayUnit * quantity;
    const variant = asVariant(item.variant);

    const thumbnailFileName = useMemo(() => {
        if (typeof item.variant === 'string') return undefined;
        const images = item.variant?.images ?? [];
        if (!images.length) return undefined;

        const sortedImages = [...images].sort((a, b) => {
            const featuredDiff = Number(Boolean(b.isFeatured)) - Number(Boolean(a.isFeatured));
            if (featuredDiff !== 0) return featuredDiff;
            return Number(a.sortOrder ?? Number.MAX_SAFE_INTEGER) - Number(b.sortOrder ?? Number.MAX_SAFE_INTEGER);
        });

        return sortedImages[0]?.imageUrl;
    }, [item.variant]);

    return (
        <li
            className="flex py-4"
            key={typeof item.variant === 'string' ? `${item.variant}-${index}` : item.variant?.id ?? index}
        >
            <div className="shrink-0">
                <div className="flex size-20 items-center justify-center rounded-lg border border-(--sf-border) bg-(--sf-bg) sm:size-24">
                    {thumbnailFileName ? (
                        <ProductImage
                            fileName={thumbnailFileName}
                            alt={variant?.product?.name ?? 'Product image'}
                            className="rounded-lg object-cover"
                        />
                    ) : (
                        <ShoppingBag className="h-8 w-8 text-(--sf-muted-text)" />
                    )}
                </div>
            </div>

            <div className="ml-4 flex flex-1 items-start justify-between gap-4">
                <div>
                    <h3 className="text-sm font-medium text-(--sf-text)">{variant?.product?.name ?? 'Item'}</h3>

                    <div className="mt-1 text-sm text-(--sf-muted-text)">
                        <p>{formatAttributes(variant?.attributesJson) ?? 'Standard item'}</p>
                    </div>

                    <p className="mt-2 text-sm font-medium text-(--sf-text)">{currency(displayUnit)} each</p>
                    <p className="mt-0.5 text-sm text-(--sf-muted-text)">Line total: {currency(lineTotal)}</p>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                    <label htmlFor={`quantity-${index}`} className="sr-only">
                        Quantity, {variant?.product?.name ?? 'Item'}
                    </label>
                    <div className="grid w-20 grid-cols-1">
                        <select
                            id={`quantity-${index}`}
                            name={`quantity-${index}`}
                            value={quantity}
                            onChange={(event) => onQuantityChange(index, Number(event.target.value))}
                            aria-label={`Quantity, ${variant?.product?.name ?? 'Item'}`}
                            className="col-start-1 row-start-1 appearance-none rounded-md bg-(--sf-panel) py-2 pr-8 pl-3 text-sm text-(--sf-text) outline-1 -outline-offset-1 outline-(--sf-border) focus:outline-2 focus:-outline-offset-2 focus:outline-(--sf-accent)"
                        >
                            {quantityOptions.map((option) => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                        <ChevronDown
                            aria-hidden="true"
                            className="pointer-events-none col-start-1 row-start-1 mr-2 h-4 w-4 self-center justify-self-end text-(--sf-muted-text)"
                        />
                    </div>

                    <button
                        type="button"
                        onClick={() => onRemove(index)}
                        className="p-1.5 text-(--sf-muted-text) hover:text-(--sf-error)"
                    >
                        <span className="sr-only">Remove</span>
                        <Trash2 aria-hidden="true" className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </li>
    );
}
