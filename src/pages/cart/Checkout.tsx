import React, { useEffect, useMemo, useState } from 'react';
import { ShoppingBag, ShieldCheck, CreditCard } from 'lucide-react';
import { apiOrderById, apiOrderBySessionId, updateCustomerInformation } from '../../services/OrderService';
import { OrderData } from './types';
import { CartStore } from '../../state/CartStore';
import {fetchShippingMethods, ShippingMethod, PaymentMethodKey, fetchPaymentMethodsConfig, PaymentMethodsConfig, PaymentMethodInfo} from "../../services/StoreSettings";

// Interface shaped like backend HtmlFormField
interface HtmlFormField {
  type: string; // e.g. "hidden"
  name: string;
  value: string;
}

const gatewayPath = 'https://sandbox.payfast.co.za/eng/process';

const Checkout: React.FC = () => {
  //Settings
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [selectedMethodId, setSelectedMethodId] = useState<number | null>(null);
  const [address, setAddress] = useState({
    street: '',
    city: '',
    postalCode: '',
    province: ''
  });

// Load shipping options on mount
  useEffect(() => {
    fetchShippingMethods().then(methods => {
      setShippingMethods(methods.filter(m => m.isActive));
    });
    // Load payment methods config from settings (new JSON format)
    fetchPaymentMethodsConfig().then((cfg) => {
      setPaymentConfig(cfg);
      const keys = Object.entries(cfg)
        .filter(([_, info]) => !!info && (info as PaymentMethodInfo).enabled)
        .map(([key]) => key as PaymentMethodKey);
      setEnabledPayments(keys);
      setSelectedPayment((prev) => prev ?? (keys[0] || null));
    });
  }, []);

// Helper to check if we need an address
  const needsShippingAddress = useMemo(() => {
    const selected = shippingMethods.find(m => m.id === selectedMethodId);
    const name = selected?.name?.toLowerCase().trim() || '';
    // Delivery address is NOT required for In-store Pickup (and common variants)
    const isInStorePickup = (
      name === 'in-store pickup' ||
      name === 'in store pickup' ||
      name === 'instore pickup' ||
      name === 'pickup' ||
      name === 'collect'
    );
    return !!selected && !isInStorePickup;
  }, [selectedMethodId, shippingMethods]);

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

  // Payment methods from settings (new JSON format)
  const [paymentConfig, setPaymentConfig] = useState<PaymentMethodsConfig>({});
  const [enabledPayments, setEnabledPayments] = useState<PaymentMethodKey[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethodKey | null>(null);

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

  // Order summary calculations for the right column
  const itemsTotal = useMemo(() => {
    const items = order?.items ?? [];
    return items.reduce((sum, it) => sum + Number(it.unitPrice || 0) * Number(it.quantity || 0), 0);
  }, [order]);

  const selectedShipping = useMemo(() => {
    return shippingMethods.find((m) => m.id === selectedMethodId) || null;
  }, [selectedMethodId, shippingMethods]);

  const shippingFee = useMemo(() => {
    return Number(selectedShipping?.baseFee || 0);
  }, [selectedShipping]);

  const grandTotal = useMemo(() => itemsTotal + shippingFee, [itemsTotal, shippingFee]);

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
        ? ['http://localhost:8080', 'http://127.0.0.1:8080']
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

  // Simple handler for In-Store payment selection
  const handleInStoreCheckout = async () => {
    if (!emailValid) {
      setEmailTouched(true);
      alert('Please enter a valid email address before continuing.');
      return;
    }
    try {
      setIsProcessing(true);
      const sid = sessionId ?? CartStore.getOrderSessionId() ?? undefined;
      await updateCustomerInformation({ email }, sid);
      alert('Your order will be reserved for in-store payment. You can complete payment when you collect your items.');
    } catch (e) {
      console.error('[In-Store] Failed to update customer information:', e);
      alert('Could not save your email address to the order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT COLUMN: Input Details */}
        <div className="space-y-8">

          {/* Section 1: Email */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="bg-blue-600 text-white w-6 h-6 rounded-full text-xs flex items-center justify-center">1</span>
              Contact Information
            </h3>
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full p-3 border rounded-xl"
            />
          </section>

          {/* Section 2: Shipping Method */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="bg-blue-600 text-white w-6 h-6 rounded-full text-xs flex items-center justify-center">2</span>
              Shipping Method
            </h3>
            <div className="grid gap-3">
              {shippingMethods.map(method => (
                  <label
                      key={method.id}
                      className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${selectedMethodId === method.id ? 'border-blue-600 bg-blue-50' : 'border-gray-100'}`}
                  >
                    <div className="flex justify-between items-center">
                      <input
                          type="radio"
                          name="shipping"
                          className="hidden"
                          onChange={() => setSelectedMethodId(method.id!)}
                      />
                      <div>
                        <p className="font-bold">{method.name}</p>
                        <p className="text-sm text-gray-500">{method.estimatedDays} delivery</p>
                      </div>
                      <span className="font-bold">R{method.baseFee}</span>
                    </div>
                  </label>
              ))}
            </div>

            {/* Conditional Address Fields */}
            {needsShippingAddress && (
                <div className="mt-6 space-y-3 animate-in slide-in-from-top-4 duration-300">
                  <p className="text-sm font-semibold text-gray-600">Delivery Address</p>
                  <input
                      placeholder="Street Address"
                      className="w-full p-3 border rounded-xl"
                      onChange={(e) => setAddress({...address, street: e.target.value})}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                        placeholder="City"
                        className="p-3 border rounded-xl"
                        onChange={(e) => setAddress({...address, city: e.target.value})}
                    />
                    <input
                        placeholder="Postal Code"
                        className="p-3 border rounded-xl"
                        onChange={(e) => setAddress({...address, postalCode: e.target.value})}
                    />
                  </div>
                </div>
            )}
          </section>

          {/* Section 3: Payment */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="bg-blue-600 text-white w-6 h-6 rounded-full text-xs flex items-center justify-center">3</span>
              Payment Method
            </h3>
            {enabledPayments.length === 0 ? (
              <div className="p-4 border-2 border-yellow-400 bg-yellow-50 rounded-xl text-sm text-yellow-800">
                No payment methods are currently available. Please contact the store.
              </div>
            ) : (
              <div className="grid gap-3">
                {enabledPayments.map((pm) => {
                  const info = paymentConfig[pm as PaymentMethodKey] as PaymentMethodInfo | undefined;
                  const title = info?.displayName || (pm === 'IN_STORE' ? 'Pay in store' : 'FastPay');
                  const desc = info?.description || (pm === 'IN_STORE' ? 'Cash/Card at Pickup' : 'Card / Instant EFT / Scan to Pay');
                  return (
                    <label key={pm} className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${selectedPayment === pm ? 'border-blue-600 bg-blue-50' : 'border-gray-100'}`}>
                      <div className="flex justify-between items-center w-full">
                        <input
                          type="radio"
                          name="payment"
                          className="hidden"
                          checked={selectedPayment === pm}
                          onChange={() => setSelectedPayment(pm)}
                        />
                        <div className="flex items-center gap-3">
                          <CreditCard className="text-blue-600" />
                          <div>
                            <p className="font-bold">{title}</p>
                            {desc ? <p className="text-xs text-gray-500">{desc}</p> : null}
                          </div>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* RIGHT COLUMN: Order Summary (Sticky) */}
        <div className="lg:sticky lg:top-8 h-fit space-y-4">
          <section className="bg-white p-6 rounded-2xl shadow-sm border">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <ShoppingBag className="text-blue-600" /> Order Summary
              <span className="ml-auto text-sm text-gray-500">#{order?.id ?? '—'}</span>
            </h3>

            {loading ? (
              <div className="text-sm text-gray-600">Loading order details...</div>
            ) : error ? (
              <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg p-3">{error}</div>
            ) : (
              <>
                <div className="space-y-3">
                  {(order?.items ?? []).map((item, idx) => {
                    const qty = Number(item.quantity || 0);
                    const price = Number(item.unitPrice || 0);
                    const lineTotal = qty * price;
                    return (
                      <div key={idx} className="flex items-start justify-between text-sm">
                        <div className="max-w-[65%]">
                          <p className="font-medium text-gray-800 truncate">{item?.variant?.product?.name ?? 'Product'}</p>
                          {item?.variant?.attributesJson ? (
                            <p className="text-xs text-gray-500 truncate">{item.variant.attributesJson}</p>
                          ) : null}
                          <p className="text-xs text-gray-500">Qty: {qty} × R{price.toFixed(2)}</p>
                        </div>
                        <div className="text-right font-semibold">R{lineTotal.toFixed(2)}</div>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t mt-4 pt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">R{itemsTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping{selectedShipping?.name ? ` (${selectedShipping.name})` : ''}</span>
                    <span className="font-medium">R{shippingFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-gray-900 border-t pt-3">
                    <span>Total</span>
                    <span className="text-blue-600">R{grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </>
            )}
          </section>

          <button
              onClick={selectedPayment === 'IN_STORE' ? handleInStoreCheckout : handlePayFastCheckout}
              disabled={!emailValid || !selectedMethodId || (needsShippingAddress && !address.street) || !selectedPayment}
              className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold"
          >
            {selectedPayment === 'IN_STORE' ? 'Reserve & Pay In-Store' : 'Complete Purchase'}
          </button>
        </div>
      </div>

      {/*<div className="max-w-3xl mx-auto">*/}
      {/*  <div className="bg-white shadow-sm rounded-2xl overflow-hidden border border-gray-100">*/}
      {/*    /!* Header *!/*/}
      {/*    <div className="p-6 border-b border-gray-100 flex items-center justify-between">*/}
      {/*      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">*/}
      {/*        <ShoppingBag className="text-blue-600" /> Checkout ({selectedPayment === 'IN_STORE' ? 'In-Store' : 'FastPay'})*/}
      {/*      </h1>*/}
      {/*      <span className="text-sm text-gray-500">Order #{order?.id ?? '—'}</span>*/}
      {/*    </div>*/}

      {/*    <div className="p-8">*/}
      {/*      /!* Loading / Error *!/*/}
      {/*      {loading && (*/}
      {/*        <div className="mb-6 text-sm text-gray-600">Loading order details...</div>*/}
      {/*      )}*/}
      {/*      {error && (*/}
      {/*        <div className="mb-6 text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg p-3">{error}</div>*/}
      {/*      )}*/}

      {/*      /!* Order Summary *!/*/}
      {/*      {order && (*/}
      {/*        <div className="space-y-4 mb-8">*/}
      {/*          {(order.items ?? []).map((item, idx) => {*/}
      {/*            const qty = Number(item.quantity || 0);*/}
      {/*            const price = Number(item.unitPrice || 0);*/}
      {/*            const lineTotal = qty * price;*/}
      {/*            return (*/}
      {/*              <div key={idx} className="flex justify-between text-gray-700">*/}
      {/*                <span>*/}
      {/*                  {item.variant?.product?.name} - {item.variant?.attributesJson}*/}
      {/*                </span>*/}
      {/*                <span className="font-medium">R {lineTotal.toFixed(2)}</span>*/}
      {/*              </div>*/}
      {/*            );*/}
      {/*          })}*/}
      {/*          <div className="border-t pt-4 flex justify-between text-xl font-bold text-gray-900">*/}
      {/*            <span>Total Amount</span>*/}
      {/*            <span className="text-blue-600">R {computedTotal.toFixed(2)}</span>*/}
      {/*          </div>*/}
      {/*        </div>*/}
      {/*      )}*/}

      {/*      /!* Email Address *!/*/}
      {/*      <div className="mb-6">*/}
      {/*        <label htmlFor="checkout-email" className="block text-sm font-medium text-gray-700 mb-1">*/}
      {/*          Email address*/}
      {/*        </label>*/}
      {/*        <input*/}
      {/*          id="checkout-email"*/}
      {/*          name="email"*/}
      {/*          type="email"*/}
      {/*          inputMode="email"*/}
      {/*          autoComplete="email"*/}
      {/*          required*/}
      {/*          value={email}*/}
      {/*          onChange={(e) => setEmail(e.target.value)}*/}
      {/*          onBlur={() => setEmailTouched(true)}*/}
      {/*          aria-invalid={emailTouched && !emailValid}*/}
      {/*          aria-describedby="checkout-email-error"*/}
      {/*          placeholder="you@example.com"*/}
      {/*          className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all ${*/}
      {/*            emailTouched && !emailValid*/}
      {/*              ? 'border-red-300 focus:ring-red-200'*/}
      {/*              : 'border-gray-300 focus:ring-blue-200'*/}
      {/*          }`}*/}
      {/*        />*/}
      {/*        {emailTouched && !emailValid && (*/}
      {/*          <p id="checkout-email-error" className="mt-2 text-sm text-red-600">*/}
      {/*            Please enter a valid email address.*/}
      {/*          </p>*/}
      {/*        )}*/}
      {/*      </div>*/}

      {/*      /!* Payment Button *!/*/}
      {/*      <button*/}
      {/*        onClick={selectedPayment === 'IN_STORE' ? handleInStoreCheckout : handlePayFastCheckout}*/}
      {/*        disabled={isProcessing || loading || !order?.id || !emailValid || !selectedPayment}*/}
      {/*        className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl font-bold text-white shadow-lg transition-all ${*/}
      {/*          isProcessing || loading || !order?.id || !emailValid || !selectedPayment ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'*/}
      {/*        }`}*/}
      {/*      >*/}
      {/*        <CreditCard size={20} />*/}
      {/*        {isProcessing*/}
      {/*          ? (selectedPayment === 'IN_STORE' ? 'Saving...' : 'Preparing Secure Gateway...')*/}
      {/*          : (selectedPayment === 'IN_STORE' ? 'Reserve & Pay In-Store' : 'Pay via PayFast (Gateway)')}*/}
      {/*      </button>*/}

      {/*      /!* Trust Badges *!/*/}
      {/*      <div className="mt-8 grid grid-cols-2 gap-4 border-t pt-6">*/}
      {/*        <div className="flex items-center gap-2 text-xs text-gray-500">*/}
      {/*          <ShieldCheck className="text-green-500" size={16} />*/}
      {/*          Secure 256-bit SSL Encryption*/}
      {/*        </div>*/}
      {/*        <div className="flex items-center justify-end">*/}
      {/*          <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Sandbox Mode</span>*/}
      {/*        </div>*/}
      {/*      </div>*/}
      {/*    </div>*/}
      {/*  </div>*/}
      {/*</div>*/}
    </div>
  );
};

export default Checkout;
