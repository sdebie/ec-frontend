import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartStore } from '../../state/CartStore';
import { OrderItemsData, OrderData } from './types';
import { createOrder } from '../../services/OrderService';
import { fetchVariantsByIds } from '../../services/ProductService';

// LocalStorage key used across the app
const LS_KEY = 'ec_cart_order_items';

const currency = (val?: number | null) =>
  typeof val === 'number' ? `R ${val.toFixed(2)}` : '—';

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<OrderItemsData[]>([]);
  const [placingOrder, setPlacingOrder] = useState(false);

  // Read from localStorage and keep in sync with CartStore updates
  useEffect(() => {
    const read = async () => {
      try {
        const raw = typeof window !== 'undefined' ? window.localStorage.getItem(LS_KEY) : null;
        const parsed: OrderItemsData[] = raw ? JSON.parse(raw) : [];
        const safeItems = Array.isArray(parsed) ? parsed : [];

        // Enrich items whose variant is only an ID by fetching details in one go
        const variantIds = Array.from(new Set(
          safeItems
            .map(it => (typeof it.variant === 'string' ? it.variant : it.variant?.id))
            .filter((v): v is string => typeof v === 'string')
        ));

        if (variantIds.length > 0) {
          try {
            const variants = await fetchVariantsByIds(variantIds);
            const map = new Map<string, any>();
            variants.forEach(v => map.set(v.id, v));
            const enriched = safeItems.map(it => {
              const vid = typeof it.variant === 'string' ? it.variant : it.variant?.id;
              const full = vid != null ? map.get(vid) : undefined;
              return full ? { ...it, variant: full } : it;
            });
            setItems(enriched);
            // Persist enriched items back to localStorage for consistency across tabs
            try {
              if (typeof window !== 'undefined') {
                window.localStorage.setItem(LS_KEY, JSON.stringify(enriched));
              }
            } catch {}
            return;
          } catch (e) {
            // If enrichment fails, fall back to raw items
            console.warn('Failed to enrich variants by IDs', e);
          }
        }
        setItems(safeItems);
      } catch (_) {
        setItems([]);
      }
    };

    // initial
    read();

    // subscribe for in-app changes
    const unsub = CartStore.subscribe(read);

    // and for other tabs
    const onStorage = (e: StorageEvent) => {
      if (e.key === LS_KEY) read();
    };
    window.addEventListener('storage', onStorage);
    return () => {
      unsub();
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const subtotal = useMemo(
    () => items.reduce((sum, it) => sum + Number(it.unitPrice || 0) * Number(it.quantity || 0), 0),
    [items]
  );

  const hasItems = items.length > 0;

  const handleCheckout = async () => {
    if (!hasItems || placingOrder) return;
    setPlacingOrder(true);
    try {
      const payload: OrderData = { sessionId: CartStore.getOrderSessionId(), items: items.map(i => ({
        unitPrice: i.unitPrice,
        quantity: i.quantity,
        // Always send only the variant ID to backend
        variant: typeof i.variant === 'string' ? i.variant : i.variant?.id,

      })) };
      await createOrder<OrderData>(payload);
      navigate('/checkout');
    } catch (err) {
      console.error('Failed to create order before checkout', err);
      // Fallback: still navigate to checkout so user isn't blocked
      navigate('/checkout');
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>

      {!hasItems && (
        <div className="bg-white border rounded p-6 text-center text-gray-600">
          Your cart is empty.
          <div className="mt-4">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => navigate('/products')}
            >
              Browse Products
            </button>
          </div>
        </div>
      )}

      {hasItems && (
        <div className="space-y-4">
          <div className="bg-white border rounded divide-y">
            {items.map((it, idx) => (
              <div key={idx} className="p-4 flex items-center justify-between">
                <div className="text-sm text-gray-800">
                  <div className="font-medium">{it?.variant?.product?.name ?? 'Item'}</div>
                  <div className="font-medium">{it?.variant?.attributesJson ?? 'Item'}</div>
                  <div className="text-gray-500">Qty: {it.quantity}</div>
                </div>
                <div className="text-sm text-gray-700">{currency((it.unitPrice || 0) * (it.quantity || 0))}</div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-lg font-semibold">
            <div>Subtotal</div>
            <div>{currency(subtotal)}</div>
          </div>

          <div className="flex gap-3">
            <button
              className="px-4 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
              onClick={() => navigate('/products')}
            >
              Continue Shopping
            </button>
            <button
              className="px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded hover:bg-red-100"
              onClick={() => CartStore.resetAndNewSession()}
              disabled={!hasItems}
              title="Clears all items and starts a fresh cart session"
            >
              Clear Cart & New Session
            </button>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
              onClick={handleCheckout}
              disabled={!hasItems || placingOrder}
            >
              {placingOrder ? 'Placing order…' : 'Checkout'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
