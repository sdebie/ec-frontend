import { OrderData, OrderItemsData } from "../pages/types";

// A tiny event-based store to keep track of cart item count across the app
// Minimal and framework-agnostic — no external dependencies

type Listener = () => void;

const LS_KEY = "ec_cart_order_items";
const LS_ID_KEY = "ec_cart_order_id";

function calcCount(items?: OrderItemsData[]): number {
  if (!Array.isArray(items)) return 0;
  return items.reduce((sum, it) => sum + Number(it.quantity || 0), 0);
}

class CartStoreImpl {
  private listeners: Set<Listener> = new Set();
  private itemCount = 0;
  private lastOrderId: string | null = null;

  constructor() {
    // Initialize from localStorage if present
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const items: OrderItemsData[] = JSON.parse(raw);
        this.itemCount = calcCount(items);
      }
      const rawId = localStorage.getItem(LS_ID_KEY);
      if (rawId) {
        this.lastOrderId = rawId;
      }
    } catch (_) {
      // ignore parsing/storage errors
      this.itemCount = 0;
      this.lastOrderId = null;
    }

    // React to storage updates done in other tabs
    if (typeof window !== "undefined") {
      window.addEventListener("storage", (e) => {
        if (e.key === LS_KEY) {
          try {
            const items = e.newValue ? (JSON.parse(e.newValue) as OrderItemsData[]) : [];
            this.itemCount = calcCount(items);
            this.emit();
          } catch (_) {}
        }
        if (e.key === LS_ID_KEY) {
          this.lastOrderId = e.newValue || null;
          this.emit();
        }
      });
    }
  }

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private emit() {
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

  getLastOrderId(): string | null {
    return this.lastOrderId;
  }

  setFromOrder(order: OrderData | null | undefined) {
    const items = order?.items ?? [];
    this.itemCount = calcCount(items);
    this.lastOrderId = order?.id != null ? String(order.id) : null;
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(items));
      if (this.lastOrderId) {
        localStorage.setItem(LS_ID_KEY, this.lastOrderId);
      } else {
        localStorage.removeItem(LS_ID_KEY);
      }
    } catch (_) {
      // ignore storage errors
    }
    this.emit();
  }

  clear() {
    this.itemCount = 0;
    this.lastOrderId = null;
    try {
      localStorage.removeItem(LS_KEY);
      localStorage.removeItem(LS_ID_KEY);
    } catch (_) {}
    this.emit();
  }
}

export const CartStore = new CartStoreImpl();
