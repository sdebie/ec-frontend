import {OrderData, OrderItemData as OrderItemsData} from "@/types/order.types.ts";

// A tiny event-based store to keep track of cart item count across the app
// Minimal and framework-agnostic — no external dependencies

type Listener = () => void;

const LS_KEY = "ec_cart_order_items";
// We no longer persist a last order id; instead reuse the persistent cart session id
const CART_SESSION_KEY = "cart_session_id";

function calcCount(items?: OrderItemsData[]): number {
    if (!Array.isArray(items)) return 0;
    return items.reduce((sum, it) => sum + Number(it.quantity || 0), 0);
}

class CartStoreImpl {
    private listeners: Set<Listener> = new Set();
    private itemCount = 0;
    // Historically named orderSessionId, now holds the persistent cart session id
    private orderSessionId: string | null = null;

    private generateUuid(): string {
        try {
            if (typeof window !== 'undefined' && (window as any).crypto && typeof (window as any).crypto.randomUUID === 'function') {
                return (window as any).crypto.randomUUID();
            }
        } catch (_) {
        }
        // Fallback simple UUID v4 generator
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }

    constructor() {
        // Initialize from localStorage if present
        try {
            const raw = localStorage.getItem(LS_KEY);
            if (raw) {
                const items: OrderItemsData[] = JSON.parse(raw);
                this.itemCount = calcCount(items);
            }
            const sessionId = localStorage.getItem(CART_SESSION_KEY);
            this.orderSessionId = sessionId || null;
        } catch (_) {
            // ignore parsing/storage errors
            this.itemCount = 0;
            this.orderSessionId = null;
        }

        // React to storage updates done in other tabs
        if (typeof window !== "undefined") {
            window.addEventListener("storage", (e) => {
                if (e.key === LS_KEY) {
                    try {
                        const items = e.newValue ? (JSON.parse(e.newValue) as OrderItemsData[]) : [];
                        this.itemCount = calcCount(items);
                        this.emit();
                    } catch (_) {
                    }
                }
                if (e.key === CART_SESSION_KEY) {
                    this.orderSessionId = e.newValue || null;
                    this.emit();
                }
            });
        }
    }

    subscribe(fn: Listener): () => void {
        this.listeners.add(fn);
        return () => this.listeners.delete(fn);
    }

    emit() {
        this.listeners.forEach((l) => {
            try {
                l();
            } catch (_) {
                // ignore listener errors to avoid blocking others
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
        // Do NOT update session id here; it is managed by ensureCartSessionId() at app start
        try {
            localStorage.setItem(LS_KEY, JSON.stringify(items));
        } catch (_) {
            // ignore storage errors
        }
        this.emit();
    }

    setItems(items: OrderItemsData[]) {
        this.itemCount = calcCount(items);
        try {
            localStorage.setItem(LS_KEY, JSON.stringify(items));
        } catch (_) {
            // ignore storage errors
        }
        this.emit();
    }

    clear() {
        this.itemCount = 0;
        this.orderSessionId = null;
        try {
            localStorage.removeItem(LS_KEY);
            // Do not clear the cart session id here; it persists for the browser session/lifecycle
        } catch (_) {
        }
        this.emit();
    }

    // Clears all cart items and regenerates a fresh cart session id
    resetAndNewSession() {
        this.itemCount = 0;
        const newId = this.generateUuid();
        this.orderSessionId = newId;
        try {
            localStorage.removeItem(LS_KEY);
            localStorage.setItem(CART_SESSION_KEY, newId);
        } catch (_) {
        }
        this.emit();
    }
}

export const CartStore = new CartStoreImpl();
