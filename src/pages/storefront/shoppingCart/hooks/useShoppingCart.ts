import {useCallback, useEffect, useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {CartStore} from '@/store/CartStore.ts';
import {createOrder} from '@/services/OrderService.ts';
import {fetchVariantsByIds} from '@/services/graphql/product/product.service.ts';
import {getVariantId, LS_KEY} from '../../../../utils/storefront/cart.utils.ts';
import {OrderData, OrderItemsData} from "@/pages/shop/default/cart/types.ts";

type UseCartReturn = {
    items: OrderItemsData[];
    hasItems: boolean;
    itemCount: number;
    subtotal: number;
    placingOrder: boolean;
    updateQuantity: (index: number, newQuantity: number) => void;
    removeItem: (index: number) => void;
    clearCart: () => void;
    checkout: () => Promise<void>;
};

export const useShoppingCart = (): UseCartReturn => {

    const navigate = useNavigate();
    const [items, setItems] = useState<OrderItemsData[]>([]);
    const [placingOrder, setPlacingOrder] = useState(false);

    const readCart = useCallback(async () => {
        try {
            const raw = typeof window !== 'undefined' ? window.localStorage.getItem(LS_KEY) : null;

            const parsed: OrderItemsData[] = raw ? JSON.parse(raw) : [];
            const safeItems = Array.isArray(parsed) ? parsed : [];

            const variantIds = Array.from(
                new Set(
                    safeItems
                        .map((item) =>
                            typeof item.variant === 'string'
                                ? item.variant
                                : item.variant?.id
                        )
                        .filter((value): value is string => typeof value === 'string')
                )
            );

            if (variantIds.length === 0) {
                setItems(safeItems);
                return;
            }

            try {
                const variants = await fetchVariantsByIds(variantIds);
                const variantMap = new Map<string, any>();

                variants.forEach((variant) => {
                    variantMap.set(variant.id, variant);
                });

                const enrichedItems = safeItems.map((item) => {
                    const variantId = typeof item.variant === 'string' ? item.variant : item.variant?.id;

                    const fullVariant =
                        variantId != null ? variantMap.get(variantId) : undefined;

                    return fullVariant ? {...item, variant: fullVariant} : item;
                });

                setItems(enrichedItems);

                try {
                    if (typeof window !== 'undefined') {
                        window.localStorage.setItem(LS_KEY, JSON.stringify(enrichedItems));
                    }
                } catch {
                    // ignore localStorage write failure
                }
            } catch (error) {
                console.warn('Failed to enrich variants by IDs', error);
                setItems(safeItems);
            }
        } catch {
            setItems([]);
        }
    }, []);

    useEffect(() => {
        void readCart();

        const unsubscribe = CartStore.subscribe(readCart);

        const onStorage = (event: StorageEvent) => {
            if (event.key === LS_KEY) {
                void readCart();
            }
        };

        window.addEventListener('storage', onStorage);

        return () => {
            unsubscribe();
            window.removeEventListener('storage', onStorage);
        };
    }, [readCart]);

    const subtotal = useMemo(() => {
        return items.reduce(
            (sum, item) =>
                sum + Number(item.unitPrice || 0) * Number(item.quantity || 0),
            0
        );
    }, [items]);

    const itemCount = useMemo(() => {
        return items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    }, [items]);

    const hasItems = items.length > 0;

    const updateQuantity = useCallback((index: number, newQuantity: number) => {
        setItems((prevItems) => {
            const updatedItems = [...prevItems];

            if (newQuantity > 0) {
                updatedItems[index] = {
                    ...updatedItems[index],
                    quantity: newQuantity,
                };
            } else {
                updatedItems.splice(index, 1);
            }

            CartStore.setItems(updatedItems);
            return updatedItems;
        });
    }, []);

    const removeItem = useCallback((index: number) => {
        setItems((prevItems) => {
            const updatedItems = [...prevItems];
            updatedItems.splice(index, 1);
            CartStore.setItems(updatedItems);
            return updatedItems;
        });
    }, []);

    const clearCart = useCallback(() => {
        CartStore.resetAndNewSession();
        setItems([]);
    }, []);

    const checkout = useCallback(async () => {
        if (!hasItems || placingOrder) return;

        setPlacingOrder(true);

        try {
            const payload: OrderData = {
                sessionId: CartStore.getOrderSessionId() ?? undefined,
                items: items.map((item) => ({
                    unitPrice: item.unitPrice,
                    quantity: item.quantity,
                    variant: getVariantId(item),
                })),
            };

            await createOrder<OrderData>(payload);
            navigate('/checkout');
        } catch (error) {
            console.error('Failed to create order before checkout', error);
            navigate('/checkout');
        } finally {
            setPlacingOrder(false);
        }
    }, [hasItems, items, navigate, placingOrder]);

    return {
        items,
        hasItems,
        itemCount,
        subtotal,
        placingOrder,
        updateQuantity,
        removeItem,
        clearCart,
        checkout,
    };
};