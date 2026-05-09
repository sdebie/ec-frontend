import { CheckCircle2, ChevronDown, Clock3, ShoppingBag, Trash2 } from 'lucide-react';
import { useMemo } from 'react';


import ProductImage from '@/components/shared/imageupload/ProductImage.tsx';
import { useCustomerType } from '@/store/customerTypeStore.ts';
import { asVariant } from '@/types/order.types.ts';
import { formatAttributes } from '@/utils/formatAttributes.ts';
import {
    currency,
    getAvailability,
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
    const availability = getAvailability(item);
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
            className="flex py-6 sm:py-10"
            key={typeof item.variant === 'string' ? `${item.variant}-${index}` : item.variant?.id ?? index}
        >
            <div className="shrink-0">
                <div className="flex size-24 items-center justify-center rounded-md bg-(--sf-bg) object-cover sm:size-48">
                    {thumbnailFileName ? (
                        <ProductImage
                            fileName={thumbnailFileName}
                            alt={variant?.product?.name ?? 'Product image'}
                            className="rounded-md object-cover"
                        />
                    ) : (
                        <ShoppingBag className="h-10 w-10 text-(--sf-muted-text) sm:h-14 sm:w-14" />
                    )}
                </div>
            </div>

            <div className="ml-4 flex flex-1 flex-col justify-between sm:ml-6">
                <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
                    <div>
                        <div className="flex justify-between gap-4">
                            <h3 className="text-sm font-medium text-(--sf-text)">{variant?.product?.name ?? 'Item'}</h3>
                        </div>

                        <div className="mt-1 flex flex-wrap text-sm text-(--sf-muted-text)">
                            <p>{formatAttributes(variant?.attributesJson) ?? 'Standard item'}</p>
                        </div>

                        <p className="mt-3 text-sm font-medium text-(--sf-text)">{currency(displayUnit)} each</p>

                        <p className="mt-1 text-sm text-(--sf-muted-text)">Line total: {currency(lineTotal)}</p>
                    </div>

                    <div className="mt-4 sm:mt-0 sm:pr-9">
                        <label htmlFor={`quantity-${index}`} className="sr-only">
                            Quantity, {variant?.product?.name ?? 'Item'}
                        </label>

                        <div className="grid w-full max-w-20 grid-cols-1">
                            <select
                                id={`quantity-${index}`}
                                name={`quantity-${index}`}
                                value={quantity}
                                onChange={(event) => onQuantityChange(index, Number(event.target.value))}
                                aria-label={`Quantity, ${variant?.product?.name ?? 'Item'}`}
                                className="col-start-1 row-start-1 appearance-none rounded-md bg-(--sf-panel) py-2 pr-8 pl-3 text-base text-(--sf-text) outline-1 -outline-offset-1 outline-(--sf-border) focus:outline-2 focus:-outline-offset-2 focus:outline-(--sf-accent) sm:text-sm"
                            >
                                {quantityOptions.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>

                            <ChevronDown
                                aria-hidden="true"
                                className="pointer-events-none col-start-1 row-start-1 mr-2 h-5 w-5 self-center justify-self-end text-(--sf-muted-text) sm:h-4 sm:w-4"
                            />
                        </div>

                        <div className="absolute top-0 right-0">
                            <button
                                type="button"
                                onClick={() => onRemove(index)}
                                className="-m-2 inline-flex p-2 text-(--sf-muted-text) hover:text-(--sf-error)"
                            >
                                <span className="sr-only">Remove</span>
                                <Trash2 aria-hidden="true" className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>

                <p className="mt-4 flex items-center space-x-2 text-sm text-(--sf-text)">
                    {availability.inStock ? (
                        <CheckCircle2 aria-hidden="true" className="h-5 w-5 shrink-0 text-(--sf-success)" />
                    ) : (
                        <Clock3 aria-hidden="true" className="h-5 w-5 shrink-0 text-(--sf-muted-text)" />
                    )}
                    <span>{availability.label}</span>
                </p>
            </div>
        </li>
    );
}
