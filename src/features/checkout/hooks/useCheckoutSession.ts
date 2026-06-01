import {useEffect, useMemo, useState} from 'react';

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
    const [order, setOrder] = useState<OrderData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Restore email from localStorage on mount (isAuthenticated is owned by useCheckoutCustomer)
    useEffect(() => {
        try {
            const saved = window.localStorage.getItem(CHECKOUT_EMAIL_STORAGE_KEY) || '';
            if (saved) setEmail(saved);
        } catch {
            /* ignore — SSR or private-mode restrictions */
        }
    }, []);

    // Parse URL params once — these never change during the session
    const {sessionId, orderId} = useMemo(() => {
        const params = new URLSearchParams(window.location.search);
        return {
            sessionId: params.get('sessionId') ?? undefined,
            orderId: params.get('orderId') ?? undefined,
        };
    }, []);

    // Hydrate the order from the API on mount
    useEffect(() => {
        const load = async () => {
            const sid = resolveCheckoutSessionId(sessionId);
            setLoading(true);
            setError(null);
            try {
                let data: OrderData | null = null;
                if (sid) {
                    data = (await apiOrderBySessionId(sid)) ?? null;
                } else if (orderId) {
                    const idParam = String(orderId);
                    if (idParam.length < 8) throw new Error('Invalid orderId in URL.');
                    data = await apiOrderById(idParam);
                } else {
                    throw new Error('Missing sessionId or orderId in URL.');
                }

                setOrder(data);
                const orderEmail = data?.customer?.email?.trim();
                if (orderEmail) setEmail(orderEmail);
                cartStore.setFromOrder(data ?? null);
            } catch (e: unknown) {
                console.error('Failed to fetch order', e);
                setError(e instanceof Error ? e.message : 'Failed to fetch order');
            } finally {
                setLoading(false);
            }
        };
        void load();
    }, [sessionId, orderId]);

    const emailValid = useMemo(
        () => !!email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
        [email],
    );

    const itemsTotal = useMemo(() => {
        return (order?.items ?? []).reduce(
            (sum, it) => sum + Number(it.unitPrice || 0) * Number(it.quantity || 0),
            0,
        );
    }, [order]);

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
        order,
        loading,
        error,
        itemsTotal,
        persistEmailSession,
        clearEmailSession,
    };
}
