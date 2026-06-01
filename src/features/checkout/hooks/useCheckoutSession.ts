import {useEffect, useMemo, useState} from 'react';

import {useQuery} from '@tanstack/react-query';

import {
    CHECKOUT_AUTH_STORAGE_KEY,
    CHECKOUT_EMAIL_STORAGE_KEY,
    resolveCheckoutSessionId,
} from '@/features/checkout/utils/checkout.helpers.ts';
import {apiOrderById, apiOrderBySessionId} from '@/services/graphql/order/OrderService.graphql.ts';
import {cartStore} from '@/store/storefrontCartStore.ts';
import type {OrderData} from '@/types/order.types.ts';

export type CheckoutSessionState = {
    email: string;
    setEmail: (email: string) => void;
    emailTouched: boolean;
    setEmailTouched: (v: boolean) => void;
    emailValid: boolean;
    /** URL-derived session param — pass through to submit handlers */
    sessionId: string | undefined;
    order: OrderData | null;
    loading: boolean;
    error: string | null;
    itemsTotal: number;
    /**
     * Persists email + authenticated flag to localStorage.
     * Call this after a successful login so the state survives a refresh.
     */
    persistEmailSession: (email: string) => void;
    /**
     * Removes checkout keys from localStorage and resets the cart store.
     * Call this after a successful checkout submission.
     */
    clearEmailSession: () => void;
};

/**
 * Manages checkout email state and order hydration from the URL session/order params.
 *
 * Responsibilities:
 *  - Restores `email` from localStorage on mount.
 *  - Loads the active order via `sessionId` or `orderId` URL params.
 *  - Exposes helpers to persist / clear the email session in localStorage.
 */
export function useCheckoutSession(): CheckoutSessionState {
    const [email, setEmail] = useState('');
    const [emailTouched, setEmailTouched] = useState(false);

    // URL params are parsed once — they never change during a checkout session.
    const {sessionId, orderId} = useMemo(() => {
        const params = new URLSearchParams(window.location.search);
        return {
            sessionId: params.get('sessionId') ?? undefined,
            orderId: params.get('orderId') ?? undefined,
        };
    }, []);

    // Restore email from localStorage on mount
    useEffect(() => {
        try {
            const saved = window.localStorage.getItem(CHECKOUT_EMAIL_STORAGE_KEY) || '';
            if (saved) setEmail(saved);
        } catch { /* ignore — SSR or private-mode restrictions */ }
    }, []);

    // Order fetch — React Query caches per session/order ID.
    // staleTime: Infinity because an order's items/total don't change during checkout.
    const orderQuery = useQuery({
        queryKey: ['checkoutOrder', sessionId ?? '', orderId ?? ''],
        queryFn: async (): Promise<OrderData | null> => {
            const sid = resolveCheckoutSessionId(sessionId);
            if (sid) {
                return (await apiOrderBySessionId(sid)) ?? null;
            }
            if (orderId) {
                const idParam = String(orderId);
                if (idParam.length < 8) throw new Error('Invalid orderId in URL.');
                return await apiOrderById(idParam);
            }
            throw new Error('Missing sessionId or orderId in URL.');
        },
        enabled: !!(sessionId || orderId),
        staleTime: Infinity,
        retry: 1,
    });

    // Side effects when the order data first arrives
    useEffect(() => {
        const data = orderQuery.data;
        if (!data) return;
        const orderEmail = data.customer?.email?.trim();
        if (orderEmail) setEmail(orderEmail);
        try { cartStore.setFromOrder(data); } catch { /* ignore */ }
    }, [orderQuery.data]);

    const emailValid = useMemo(
        () => !!email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
        [email],
    );

    const itemsTotal = useMemo(() => {
        return (orderQuery.data?.items ?? []).reduce(
            (sum, it) => sum + Number(it.unitPrice || 0) * Number(it.quantity || 0),
            0,
        );
    }, [orderQuery.data]);

    const persistEmailSession = (emailToSave: string) => {
        try {
            window.localStorage.setItem(CHECKOUT_EMAIL_STORAGE_KEY, emailToSave.trim());
            window.localStorage.setItem(CHECKOUT_AUTH_STORAGE_KEY, 'true');
        } catch {
            /* ignore */
        }
    };

    const clearEmailSession = () => {
        try {
            window.localStorage.removeItem(CHECKOUT_EMAIL_STORAGE_KEY);
            window.localStorage.removeItem(CHECKOUT_AUTH_STORAGE_KEY);
        } catch {
            /* ignore */
        }
        try {
            cartStore.clear();
            cartStore.resetAndNewSession();
        } catch {
            /* ignore */
        }
    };

    return {
        email,
        setEmail,
        emailTouched,
        setEmailTouched,
        emailValid,
        sessionId,
        order: orderQuery.data ?? null,
        loading: orderQuery.isPending && orderQuery.fetchStatus !== 'idle',
        error: orderQuery.isError
            ? (orderQuery.error instanceof Error ? orderQuery.error.message : 'Failed to fetch order')
            : null,
        itemsTotal,
        persistEmailSession,
        clearEmailSession,
    };
}
