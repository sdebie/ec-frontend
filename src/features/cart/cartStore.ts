import { createStore } from 'zustand/vanilla';

import { STOREFRONT_TENANT_RESET_EVENT } from '@/storefront/tenant/tenantLifecycle';
import {
    getCartItemsStorageKey,
    getCartSessionStorageKey,
} from '@/utils/storefront/tenantStorageKeys';

import type { OrderData, OrderItemData } from '@/types/order.types.ts';

function calcCount(items?: OrderItemData[]): number {
    if (!Array.isArray(items)) return 0;
    return items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
}

function generateUuid(): string {
    try {
        if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
            return window.crypto.randomUUID();
        }
    } catch {
        // ignore randomUUID failures and fallback
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
        const random = (Math.random() * 16) | 0;
        const value = char === 'x' ? random : (random & 0x3) | 0x8;
        return value.toString(16);
    });
}

interface CartState {
    itemCount: number;
    orderSessionId: string | null;
}

function readInitialState(): CartState {
    try {
        const raw = localStorage.getItem(getCartItemsStorageKey());
        const itemCount = raw ? calcCount(JSON.parse(raw) as OrderItemData[]) : 0;
        const orderSessionId = localStorage.getItem(getCartSessionStorageKey()) || null;
        return { itemCount, orderSessionId };
    } catch {
        return { itemCount: 0, orderSessionId: null };
    }
}

const _store = createStore<CartState>()(() => readInitialState());

if (typeof window !== 'undefined') {
    window.addEventListener('storage', (event) => {
        if (event.key === getCartItemsStorageKey()) {
            try {
                const items = event.newValue ? (JSON.parse(event.newValue) as OrderItemData[]) : [];
                _store.setState({ itemCount: calcCount(items) });
            } catch {
                // ignore storage parse failures
            }
        }
        if (event.key === getCartSessionStorageKey()) {
            _store.setState({ orderSessionId: event.newValue || null });
        }
    });

    window.addEventListener(STOREFRONT_TENANT_RESET_EVENT, () => {
        _store.setState({ itemCount: 0, orderSessionId: null });
    });
}

export const cartStore = {
    subscribe(listener: () => void): () => void {
        return _store.subscribe(() => listener());
    },

    emit() {
        _store.setState({});
    },

    getItemCount(): number {
        return _store.getState().itemCount;
    },

    getOrderSessionId(): string | null {
        return _store.getState().orderSessionId;
    },

    setFromOrder(order: OrderData | null | undefined) {
        const items = order?.items ?? [];
        try {
            localStorage.setItem(getCartItemsStorageKey(), JSON.stringify(items));
        } catch {
            // ignore storage write failures
        }
        _store.setState({ itemCount: calcCount(items) });
    },

    mergeItems(order: OrderData): OrderData {
        const cartItemsKey = getCartItemsStorageKey();
        const incoming: OrderItemData[] = Array.isArray(order?.items) ? order.items : [];

        let existing: OrderItemData[] = [];
        try {
            const raw = typeof window !== 'undefined' ? window.localStorage.getItem(cartItemsKey) : null;
            const parsed = raw ? JSON.parse(raw) : [];
            existing = Array.isArray(parsed) ? parsed : [];
        } catch {
            existing = [];
        }

        const merged: OrderItemData[] = [...existing];
        for (const inc of incoming) {
            const vid =
                typeof inc.variant === 'string' ? inc.variant : (inc.variant as { id?: string } | null)?.id;

            if (vid == null) {
                merged.push({ ...inc });
                continue;
            }

            const idx = merged.findIndex((m) => {
                const mVid = typeof m.variant === 'string' ? m.variant : (m.variant as { id?: string } | null)?.id;
                return mVid === vid;
            });

            if (idx >= 0) {
                const prev = merged[idx] ?? {};
                merged[idx] = {
                    ...prev,
                    ...inc,
                    quantity: Number(prev.quantity ?? 0) + Number(inc.quantity ?? 0),
                    unitPrice: typeof inc.unitPrice === 'number' ? inc.unitPrice : prev.unitPrice,
                    variant:
                        typeof inc.variant === 'object' && inc.variant !== null ? inc.variant : prev.variant,
                };
            } else {
                merged.push({ ...inc });
            }
        }

        try {
            if (typeof window !== 'undefined') {
                window.localStorage.setItem(cartItemsKey, JSON.stringify(merged));
            }
        } catch {
            // ignore
        }

        const localOrder: OrderData = { ...(order ?? {}), items: merged };
        _store.setState({ itemCount: calcCount(merged) });
        return localOrder;
    },

    setItems(items: OrderItemData[]) {
        try {
            localStorage.setItem(getCartItemsStorageKey(), JSON.stringify(items));
        } catch {
            // ignore storage write failures
        }
        _store.setState({ itemCount: calcCount(items) });
    },

    clear() {
        try {
            localStorage.removeItem(getCartItemsStorageKey());
        } catch {
            // ignore storage failures
        }
        _store.setState({ itemCount: 0, orderSessionId: null });
    },

    resetAndNewSession() {
        const newId = generateUuid();
        try {
            localStorage.removeItem(getCartItemsStorageKey());
            localStorage.setItem(getCartSessionStorageKey(), newId);
        } catch {
            // ignore storage failures
        }
        _store.setState({ itemCount: 0, orderSessionId: newId });
    },
};
