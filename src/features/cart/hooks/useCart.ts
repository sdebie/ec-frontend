import {useCallback, useEffect, useMemo, useState} from 'react';


import {cartStore} from '@/features/cart/cartStore.ts';
import {fetchVariantsByIds} from '@/services/graphql/product/product.service.ts';
import {useCustomerType} from '@/store/customerTypeStore.ts';
import {getCartItemsKey, getCartLineDisplayUnit} from '@/utils/storefront/cart.utils.ts';
import type {CartItem} from '@/features/cart/types.ts';

type UseCartReturn = {
    items: CartItem[];
    hasItems: boolean;
    itemCount: number;
    subtotal: number;
    updateQuantity: (index: number, newQuantity: number) => void;
    removeItem: (index: number) => void;
    clearCart: () => void;
};

export const useCart = (): UseCartReturn => {
    const customerType = useCustomerType();
    const [items, setItems] = useState<CartItem[]>([]);

    const readCart = useCallback(async () => {
        const cartItemsKey = getCartItemsKey();
        try {
            const raw = typeof window !== 'undefined' ? window.localStorage.getItem(cartItemsKey) : null;
            const parsed: CartItem[] = raw ? JSON.parse(raw) : [];
            const safeItems = Array.isArray(parsed) ? parsed : [];

            const variantIds = Array.from(
                new Set(
                    safeItems
                        .map((item) => (typeof item.variant === 'string' ? item.variant : item.variant?.id))
                        .filter((value): value is string => typeof value === 'string'),
                ),
            );

            if (variantIds.length === 0) {
                setItems(safeItems);
                return;
            }

            try {
                const variants = await fetchVariantsByIds(variantIds);
                const variantMap = new Map<string, (typeof variants)[number]>();
                variants.forEach((variant) => {
                    variantMap.set(variant.id, variant);
                });

                const enrichedItems: CartItem[] = safeItems.map((item) => {
                    const variantId = typeof item.variant === 'string' ? item.variant : item.variant?.id;
                    const fullVariant = variantId != null ? variantMap.get(variantId) : undefined;
                    return fullVariant
                        ? {...item, variant: fullVariant as CartItem['variant']}
                        : item;
                });

                setItems(enrichedItems);

                try {
                    if (typeof window !== 'undefined') {
                        window.localStorage.setItem(cartItemsKey, JSON.stringify(enrichedItems));
                    }
                } catch {
                    // ignore localStorage write failures
                }
            } catch {
                setItems(safeItems);
            }
        } catch {
            setItems([]);
        }
    }, []);

    useEffect(() => {
        void readCart();

        const unsubscribe = cartStore.subscribe(readCart);
        const cartItemsKey = getCartItemsKey();

        const onStorage = (event: StorageEvent) => {
            if (event.key === cartItemsKey) {
                void readCart();
            }
        };

        window.addEventListener('storage', onStorage);

        return () => {
            unsubscribe();
            window.removeEventListener('storage', onStorage);
        };
    }, [readCart]);

    const subtotal = useMemo(
        () =>
            items.reduce(
                (sum, item) =>
                    sum + getCartLineDisplayUnit(item, customerType) * Number(item.quantity || 0),
                0,
            ),
        [items, customerType],
    );

    const itemCount = useMemo(
        () => items.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
        [items],
    );

    const hasItems = items.length > 0;

    const updateQuantity = useCallback((index: number, newQuantity: number) => {
        setItems((prevItems) => {
            const updatedItems = [...prevItems];
            if (newQuantity > 0) {
                updatedItems[index] = {...updatedItems[index], quantity: newQuantity};
            } else {
                updatedItems.splice(index, 1);
            }
            cartStore.setItems(updatedItems);
            return updatedItems;
        });
    }, []);

    const removeItem = useCallback((index: number) => {
        setItems((prevItems) => {
            const updatedItems = [...prevItems];
            updatedItems.splice(index, 1);
            cartStore.setItems(updatedItems);
            return updatedItems;
        });
    }, []);

    const clearCart = useCallback(() => {
        cartStore.resetAndNewSession();
        setItems([]);
    }, []);

    return {items, hasItems, itemCount, subtotal, updateQuantity, removeItem, clearCart};
};
