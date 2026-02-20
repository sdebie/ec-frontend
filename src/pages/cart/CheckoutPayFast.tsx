import React, { useEffect, useMemo, useState } from 'react';
import { ShoppingBag, ShieldCheck, CreditCard } from 'lucide-react';
import { apiOrderById, apiOrderBySessionId, updateCustomerInformation } from '../../services/OrderService';
import { OrderData } from './types';
import { CartStore } from '../../state/CartStore';

// Interface shaped like backend HtmlFormField
interface HtmlFormField {
  type: string; // e.g. "hidden"
  name: string;
  value: string;
}

const gatewayPath = 'https://sandbox.payfast.co.za/eng/process';

const CheckoutPayFast: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  // Email capture for receipt/communication
  const [email, setEmail] = useState<string>('');
  const [emailTouched, setEmailTouched] = useState<boolean>(false);
  const emailValid = useMemo(() => {
    if (!email) return false;
    // Basic email validation pattern
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }, [email]);

  // Read sessionId or orderId from query string (prefer sessionId)
  const { sessionId, orderId } = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return {
      sessionId: params.get('sessionId') ?? undefined,
      orderId: params.get('orderId') ?? undefined,
    };
  }, []);

  useEffect(() => {
    const load = async () => {
      const sid = sessionId ?? CartStore.getOrderSessionId() ?? undefined;
      setLoading(true);
      setError(null);
      try {
        let data: OrderData | null = null;
        if (sid) {
          // Preferred: fetch by session
          const d = await apiOrderBySessionId(sid);
          data = d ?? null;
        } else if (orderId) {
          // Fallback: numeric id
          const numericId = Number(orderId);
          if (!Number.isInteger(numericId)) {
            throw new Error('Invalid orderId in URL.');
          }
          data = await apiOrderById(numericId);
        } else {
          throw new Error('Missing sessionId or orderId in URL.');
        }
        setOrder(data);
        CartStore.setFromOrder(data ?? null);
      } catch (e: any) {
        console.error('Failed to fetch order', e);
        setError(e?.message || 'Failed to fetch order');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [sessionId, orderId]);


  const computedTotal = useMemo(() => {
    if (order?.totalAmount != null) return Number(order.totalAmount);
    const items = order?.items ?? [];
    return items.reduce((sum, it) => sum + Number(it.unitPrice || 0) * Number(it.quantity || 0), 0);
  }, [order]);

  const handlePayFastCheckout = async () => {
    if (!emailValid) {
      setEmailTouched(true);
      alert('Please enter a valid email address before continuing.');
      return;
    }
    const debug = true; // new URLSearchParams(window.location.search).has('debug')

    const buildAndSubmitGatewayForm = (fields: HtmlFormField[]) => {
      if (!Array.isArray(fields) || fields.length === 0) {
        throw new Error('No form fields returned by API.');
      }

      const form = document.createElement('form');
      form.setAttribute('method', 'POST');
      form.setAttribute('action', gatewayPath);

      fields.forEach((f) => {
        const input = document.createElement('input');
        input.setAttribute('type', f.type || 'hidden');
        input.setAttribute('name', f.name);
        input.setAttribute('value', f.value ?? '');
        form.appendChild(input);
      });

      // Allow programmatic submit in some older browsers
      // @ts-ignore
      form._submit_function_ = form.submit;

      document.body.appendChild(form);
      // @ts-ignore
      if (typeof form._submit_function_ === 'function') {
        // @ts-ignore
        form._submit_function_();
      } else {
        form.submit();
      }
    };

    try {
      setIsProcessing(true);

      // First, update customer information if email is valid
      try {
        const sid = sessionId ?? CartStore.getOrderSessionId() ?? undefined;
        await updateCustomerInformation({ email }, sid);
      } catch (e) {
        console.error('[PayFast] Failed to update customer information:', e);
        alert('Could not save your email address to the order. Please try again.');
        setIsProcessing(false);
        return;
      }

      // Determine API base candidates for local and prod
      const isLocalHost =
        window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const apiBases = isLocalHost
        ? ['http://localhost:8080', 'http://192.168.1.39:8080']
        : ['https://ecapi.sdebiehome.co.za'];

      let lastErr: any = null;
      let response: Response | null = null;

      for (const base of apiBases) {
        try {
          if (debug) console.log('[PayFast][DEBUG] Requesting checkout fields from', base);

          // Backend endpoint consumes application/x-www-form-urlencoded
          if (!order || !order.id || order.totalAmount == null) {
            throw new Error('Order details are not loaded');
          }
          const body = new URLSearchParams({
            id: String(order.id),
            totalAmount: Number(order.totalAmount).toFixed(2),
          });

          response = await fetch(`${base}/api/payments/checkout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: body.toString(),
          });

          if (!response.ok) {
            const txt = await response.text().catch(() => '');
            throw new Error(`HTTP ${response.status} ${response.statusText} ${txt}`);
          }

          // Success for this base, stop trying others
          break;
        } catch (e) {
          lastErr = e;
          response = null;
          if (debug)
            console.warn('[PayFast][DEBUG] Failed using base, trying next if available:', e);
        }
      }

      if (!response) throw lastErr || new Error('No response from any API base');

      let fields: HtmlFormField[] = [];
      try {
        fields = (await response.json()) as HtmlFormField[];
      } catch (e) {
        const txt = await response.text().catch(() => '');
        throw new Error('Failed to parse JSON for /api/payments/checkout. Body: ' + txt);
      }

      if (debug) console.log('[PayFast][DEBUG] Received fields:', fields);

      // Build and submit the PayFast gateway form
      buildAndSubmitGatewayForm(fields);
    } catch (error) {
      console.error('[PayFast] Checkout initiation failed:', error);
      alert('Could not initiate payment. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-sm rounded-2xl overflow-hidden border border-gray-100">
          {/* Header */}
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <ShoppingBag className="text-blue-600" /> Checkout (FastPay)
            </h1>
            <span className="text-sm text-gray-500">Order #{order?.id ?? '—'}</span>
          </div>

          <div className="p-8">
            {/* Loading / Error */}
            {loading && (
              <div className="mb-6 text-sm text-gray-600">Loading order details...</div>
            )}
            {error && (
              <div className="mb-6 text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg p-3">{error}</div>
            )}

            {/* Order Summary */}
            {order && (
              <div className="space-y-4 mb-8">
                {(order.items ?? []).map((item, idx) => {
                  const qty = Number(item.quantity || 0);
                  const price = Number(item.unitPrice || 0);
                  const lineTotal = qty * price;
                  return (
                    <div key={idx} className="flex justify-between text-gray-700">
                      <span>
                        {item.variant.product.name} - {item.variant.attributesJson}
                      </span>
                      <span className="font-medium">R {lineTotal.toFixed(2)}</span>
                    </div>
                  );
                })}
                <div className="border-t pt-4 flex justify-between text-xl font-bold text-gray-900">
                  <span>Total Amount</span>
                  <span className="text-blue-600">R {computedTotal.toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* Email Address */}
            <div className="mb-6">
              <label htmlFor="checkout-email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                id="checkout-email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setEmailTouched(true)}
                aria-invalid={emailTouched && !emailValid}
                aria-describedby="checkout-email-error"
                placeholder="you@example.com"
                className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all ${
                  emailTouched && !emailValid
                    ? 'border-red-300 focus:ring-red-200'
                    : 'border-gray-300 focus:ring-blue-200'
                }`}
              />
              {emailTouched && !emailValid && (
                <p id="checkout-email-error" className="mt-2 text-sm text-red-600">
                  Please enter a valid email address.
                </p>
              )}
            </div>

            {/* Payment Button */}
            <button
              onClick={handlePayFastCheckout}
              disabled={isProcessing || loading || !order?.id || !emailValid}
              className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl font-bold text-white shadow-lg transition-all ${
                isProcessing || loading || !order?.id || !emailValid ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
              }`}
            >
              <CreditCard size={20} />
              {isProcessing ? 'Preparing Secure Gateway...' : 'Pay via PayFast (Gateway)'}
            </button>

            {/* Trust Badges */}
            <div className="mt-8 grid grid-cols-2 gap-4 border-t pt-6">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <ShieldCheck className="text-green-500" size={16} />
                Secure 256-bit SSL Encryption
              </div>
              <div className="flex items-center justify-end">
                <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Sandbox Mode</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPayFast;
