
import { STOREFRONT_TENANT_RESET_EVENT } from '@/storefront/tenant/tenantLifecycle';
import {
    getCartItemsStorageKey,
    getCartSessionStorageKey,
} from '@/utils/storefront/tenantStorageKeys';

import type { OrderData, OrderItemData } from '@/types/order.types.ts';

type Listener = () => void;

function calcCount(items?: OrderItemData[]): number {
    if (!Array.isArray(items)) return 0;
    return items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
}

class CartStoreImpl {
    private listeners: Set<Listener> = new Set();
    private itemCount = 0;
    private orderSessionId: string | null = null;

    constructor() {
        try {
            const raw = localStorage.getItem(getCartItemsStorageKey());
            if (raw) {
                const items: OrderItemData[] = JSON.parse(raw);
                this.itemCount = calcCount(items);
            }
            this.orderSessionId = localStorage.getItem(getCartSessionStorageKey()) || null;
        } catch {
            this.itemCount = 0;
            this.orderSessionId = null;
        }

        if (typeof window !== 'undefined') {
            window.addEventListener('storage', (event) => {
                if (event.key === getCartItemsStorageKey()) {
                    try {
                        const items = event.newValue ? (JSON.parse(event.newValue) as OrderItemData[]) : [];
                        this.itemCount = calcCount(items);
                        this.emit();
                    } catch {
                        // ignore storage parse failures
                    }
                }
                if (event.key === getCartSessionStorageKey()) {
                    this.orderSessionId = event.newValue || null;
                    this.emit();
                }
            });

            window.addEventListener(STOREFRONT_TENANT_RESET_EVENT, () => {
                this.itemCount = 0;
                this.orderSessionId = null;
                this.emit();
            });
        }
    }

    private generateUuid(): string {
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

    subscribe(listener: Listener): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    emit() {
        this.listeners.forEach((listener) => {
            try {
                listener();
            } catch {
                // ignore listener errors
            }
        });
    }

    getItemCount(): number {
        return this.itemCount;
    }

    getOrderSessionId(): string | null {
        return this.orderSessionId;
    }

    setFromOrder(order: OrderData | null | undefined) {
        const items = order?.items ?? [];
        this.itemCount = calcCount(items);
        try {
            localStorage.setItem(getCartItemsStorageKey(), JSON.stringify(items));
        } catch {
            // ignore storage write failures
        }
        this.emit();
    }

    /**
     * Merge incoming line items into persisted cart + store (local-only; no network).
     * Same semantics as the former OrderService.addToCart helper — suitable for useAddToCart.
     */
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
        this.setFromOrder(localOrder);
        return localOrder;
    }

    setItems(items: OrderItemData[]) {
        this.itemCount = calcCount(items);
        try {
            localStorage.setItem(getCartItemsStorageKey(), JSON.stringify(items));
        } catch {
            // ignore storage write failures
        }
        this.emit();
    }

    clear() {
        this.itemCount = 0;
        this.orderSessionId = null;
        try {
            localStorage.removeItem(getCartItemsStorageKey());
        } catch {
            // ignore storage failures
        }
        this.emit();
    }

    resetAndNewSession() {
        this.itemCount = 0;
        const newId = this.generateUuid();
        this.orderSessionId = newId;
        try {
            localStorage.removeItem(getCartItemsStorageKey());
            localStorage.setItem(getCartSessionStorageKey(), newId);
        } catch {
            // ignore storage failures
        }
        this.emit();
    }
}

export const cartStore = new CartStoreImpl();
