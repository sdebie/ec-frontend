import React, { useEffect, useMemo, useState } from 'react';
import { apiOrderById, apiOrderBySessionId, updateCustomerInformation } from '../../services/OrderService';
import { OrderData } from './types';
import { CartStore } from '../../state/CartStore';
import { fetchShippingMethods, ShippingMethod, PaymentMethodKey, fetchPaymentMethodsConfig, PaymentMethodsConfig, PaymentMethodInfo } from "../../services/StoreSettings";
import { lookupCustomer, loginCustomer, registerOrUpdateCustomer, CustomerProfile } from "../../services/CustomerService";
import ContactInfoSection from './components/ContactInfoSection';
import ShippingMethodSection from './components/ShippingMethodSection';
import PaymentMethodSection from './components/PaymentMethodSection';
import OrderSummary from './components/OrderSummary';
import SaveConfirmModal from './components/SaveConfirmModal';

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

  // Customer lookup/auth state
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState<boolean>(false);
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [saveDetails, setSaveDetails] = useState<boolean>(false);
  const [registerPassword, setRegisterPassword] = useState<string>('');
  const [registerPasswordConfirm, setRegisterPasswordConfirm] = useState<string>('');
  const [lookupState, setLookupState] = useState<'idle' | 'loading' | 'found' | 'not_found' | 'error'>('idle');
  // Returning user choice: login or continue as guest
  const [returningChoice, setReturningChoice] = useState<'login' | 'guest' | null>(null);
  // Confirmation modal before creating account on in-store checkout
  const [showSaveConfirm, setShowSaveConfirm] = useState<boolean>(false);

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

  // Lookup customer when email becomes valid
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!emailValid) {
        setCustomer(null);
        setIsAuthenticated(false);
        setShowLoginPrompt(false);
        setReturningChoice(null);
        setLookupState('idle');
        return;
      }
      setLookupState('loading');
      try {
        const profile = await lookupCustomer(email.trim());
        if (cancelled) return;
        setCustomer(profile);
        setLookupState(profile ? 'found' : 'not_found');
        // Reset returning choice on new lookup result
        setReturningChoice(null);
        // If delivery needed and customer is registered, prompt login/guest choice
        if (profile && profile.hasPassword && needsShippingAddress) {
          setShowLoginPrompt(true);
        } else {
          setShowLoginPrompt(false);
        }
      } catch (e) {
        console.warn('Lookup failed', e);
        setCustomer(null);
        setShowLoginPrompt(false);
        setLookupState('error');
      }
    };
    run();
    return () => { cancelled = true; };
  }, [emailValid, email, needsShippingAddress]);

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

  const prefillAddressFromProfile = (p: CustomerProfile | null) => {
    if (!p) return;
    setAddress(a => ({
      street: p.addressLine1 || a.street || '',
      city: p.city || a.city || '',
      postalCode: p.postalCode || a.postalCode || '',
      province: p.province || a.province || ''
    }));
  };

  const handleLogin = async () => {
    if (!emailValid || !loginPassword) return;
    try {
      const prof = await loginCustomer(email.trim(), loginPassword);
      setCustomer(prof);
      setIsAuthenticated(true);
      setShowLoginPrompt(false);
      prefillAddressFromProfile(prof);
    } catch (e: any) {
      alert(typeof e?.message === 'string' ? e.message : 'Login failed. Please check your password.');
    }
  };

  const registerIfChosen = async () => {
    if (!(needsShippingAddress && saveDetails)) return;
    if (!registerPassword || registerPassword.length < 6) {
      throw new Error('Please provide a password of at least 6 characters to save your details.');
    }
    if (registerPassword !== registerPasswordConfirm) {
      throw new Error('Passwords do not match. Please confirm your password.');
    }
    await registerOrUpdateCustomer({
      email: email.trim(),
      password: registerPassword,
      addressLine1: address.street,
      city: address.city,
      postalCode: address.postalCode,
      province: address.province
    });
  };

  const handlePayFastCheckout = async () => {
    if (!emailValid) {
      setEmailTouched(true);
      alert('Please enter a valid email address before continuing.');
      return;
    }
    // If delivery and an existing account exists with password and user chose to login, require authentication first
    if (needsShippingAddress && customer && customer.hasPassword && returningChoice === 'login' && !isAuthenticated) {
      alert('Please sign in to use your saved address or choose "Continue as guest".');
      return;
    }

    // If user opted to save details, register/update before payment
    try {
      await registerIfChosen();
    } catch (e: any) {
      alert(typeof e?.message === 'string' ? e.message : 'Please check your details.');
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

  // Extracted: actual in-store processing after optional confirmation
  const proceedInStoreCheckout = async () => {
    try {
      setIsProcessing(true);
      try {
        await registerIfChosen();
      } catch (e: any) {
        alert(typeof e?.message === 'string' ? e.message : 'Please check your details.');
        setIsProcessing(false);
        return;
      }
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

  // Simple handler for In-Store payment selection
  const handleInStoreCheckout = async () => {
    if (!emailValid) {
      setEmailTouched(true);
      alert('Please enter a valid email address before continuing.');
      return;
    }
    // If shopper chose to create an account and delivery address is present, show a confirmation modal first
    if (needsShippingAddress && saveDetails) {
      setShowSaveConfirm(true);
      return;
    }
    // Otherwise proceed immediately
    await proceedInStoreCheckout();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT COLUMN: Input Details */}
        <div className="space-y-8">

          {/* Section 1: Email */}
          <ContactInfoSection
            email={email}
            setEmail={setEmail}
            emailValid={emailValid}
            emailTouched={emailTouched}
            setEmailTouched={setEmailTouched}
            lookupState={lookupState}
            customer={customer}
          />

          {/* Section 2: Shipping Method */}
          <ShippingMethodSection
            shippingMethods={shippingMethods}
            selectedMethodId={selectedMethodId}
            setSelectedMethodId={(id) => setSelectedMethodId(id)}
            needsShippingAddress={needsShippingAddress}
            customer={customer}
            isAuthenticated={isAuthenticated}
            address={address}
            setAddress={setAddress}
            returningChoice={returningChoice}
            setReturningChoice={setReturningChoice}
            loginPassword={loginPassword}
            setLoginPassword={setLoginPassword}
            handleLogin={handleLogin}
            saveDetails={saveDetails}
            setSaveDetails={setSaveDetails}
            registerPassword={registerPassword}
            setRegisterPassword={setRegisterPassword}
            registerPasswordConfirm={registerPasswordConfirm}
            setRegisterPasswordConfirm={setRegisterPasswordConfirm}
          />

          {/* Section 3: Payment */}
          <PaymentMethodSection
            enabledPayments={enabledPayments}
            paymentConfig={paymentConfig}
            selectedPayment={selectedPayment}
            setSelectedPayment={(pm) => setSelectedPayment(pm)}
          />
        </div>

        {/* RIGHT COLUMN: Order Summary (Sticky) */}
        <div className="lg:sticky lg:top-8 h-fit space-y-4">
          <OrderSummary
            order={order}
            loading={loading}
            error={error}
            itemsTotal={itemsTotal}
            selectedShipping={selectedShipping}
            shippingFee={shippingFee}
            grandTotal={grandTotal}
          />

          <button
              onClick={selectedPayment === 'IN_STORE' ? handleInStoreCheckout : handlePayFastCheckout}
              disabled={
                !emailValid ||
                !selectedMethodId ||
                (needsShippingAddress && !address.street) ||
                !selectedPayment ||
                (needsShippingAddress && customer && customer.hasPassword && returningChoice === 'login' && !isAuthenticated) ||
                (needsShippingAddress && saveDetails && (!registerPassword || registerPassword.length < 6 || registerPassword !== registerPasswordConfirm))
              }
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
      <SaveConfirmModal
        show={showSaveConfirm}
        onClose={() => setShowSaveConfirm(false)}
        onConfirm={async () => { await proceedInStoreCheckout(); }}
        email={email}
        address={address}
        needsShippingAddress={needsShippingAddress}
        isProcessing={isProcessing}
      />
    </div>
  );
};

export default Checkout;
