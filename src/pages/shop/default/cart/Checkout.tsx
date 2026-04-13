import React, {useEffect, useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {apiOrderById, apiOrderBySessionId, apiUpdateOrderStatus} from '@/services/graphql/order/OrderService.graphql.ts';
import {OrderData} from '@/types/order.types.ts';
import {CartStore} from '@/store/cartStore.ts';
import {
    ShippingMethod,
    PaymentMethodKey,
    fetchPaymentMethodsConfig,
    PaymentMethodsConfig,
    PaymentMethodInfo
} from "@/services/StoreSettings.ts";
import {
    lookupCustomer,
    registerOrUpdateCustomer,
    CustomerProfile,
    updateCustomerInformation
} from "@/services/CustomerService.ts";
import ContactInfoSection from './components/ContactInfoSection.tsx';
import ShippingMethodSection from './components/ShippingMethodSection.tsx';
import PaymentMethodSection from './components/PaymentMethodSection.tsx';
import OrderSummary from './components/OrderSummary.tsx';
import SaveConfirmModal from './components/SaveConfirmModal.tsx';
import {OrderStatus} from '@/constants/enums/OrderStatus.ts';

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
    const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null);
    const [address, setAddress] = useState({
        street: '',
        city: '',
        postalCode: '',
        province: ''
    });
    // Track the initially loaded account address to detect edits
    const [initialAccountAddress, setInitialAccountAddress] = useState<{
        street: string;
        city: string;
        postalCode: string;
        province: string;
    } | null>(null);
    // When edited, allow user to decide whether to update their account address
    const [updateAccountAddress, setUpdateAccountAddress] = useState<boolean>(false);

    // Customer lookup/auth state
    const [customer, setCustomer] = useState<CustomerProfile | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
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
        // fetchShippingMethods().then(methods => {
        //     setShippingMethods(methods.filter(m => m.isActive));
        // });
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

    // Hydrate from localStorage on mount (if previously logged in)
    useEffect(() => {
        try {
            const savedEmail = window.localStorage.getItem('checkoutEmail') || '';
            const savedAuth = window.localStorage.getItem('checkoutIsAuthenticated') === 'true';
            if (savedEmail) setEmail(savedEmail);
            if (savedAuth) setIsAuthenticated(true);
        } catch {
        }
    }, []);

    // Lookup customer when email becomes valid
    useEffect(() => {
        let cancelled = false;
        const run = async () => {
            if (!emailValid) {
                setCustomer(null);
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
                // If already authenticated (e.g., restored), prefill address
                if (profile && isAuthenticated) {
                    prefillAddressFromProfile(profile);
                }
            } catch (e) {
                console.warn('Lookup failed', e);
                setCustomer(null);
                setLookupState('error');
            }
        };
        run();
        return () => {
            cancelled = true;
        };
    }, [emailValid, email, needsShippingAddress, isAuthenticated]);

    // Payment methods from settings (new JSON format)
    const [paymentConfig, setPaymentConfig] = useState<PaymentMethodsConfig>({});
    const [enabledPayments, setEnabledPayments] = useState<PaymentMethodKey[]>([]);
    const [selectedPayment, setSelectedPayment] = useState<PaymentMethodKey | null>(null);

    // Read sessionId or orderId from query string (prefer sessionId)
    const {sessionId, orderId} = useMemo(() => {
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
                    // Fallback: use UUID string id
                    const idParam = String(orderId);
                    if (!idParam || idParam.length < 8) {
                        throw new Error('Invalid orderId in URL.');
                    }
                    data = await apiOrderById(idParam);
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

    // Detect if the authenticated user's loaded address has been edited
    const isAccountAddressEdited = useMemo(() => {
        if (!isAuthenticated || !initialAccountAddress) return false;
        const norm = (v: string | undefined | null) => (v ?? '').trim();
        return (
            norm(address.street) !== norm(initialAccountAddress.street) ||
            norm(address.city) !== norm(initialAccountAddress.city) ||
            norm(address.postalCode) !== norm(initialAccountAddress.postalCode) ||
            norm(address.province) !== norm(initialAccountAddress.province)
        );
    }, [isAuthenticated, initialAccountAddress, address]);

    // Auto-uncheck when no longer edited or user not authenticated
    useEffect(() => {
        if (!isAccountAddressEdited || !isAuthenticated) {
            setUpdateAccountAddress(false);
        }
    }, [isAccountAddressEdited, isAuthenticated]);

    const prefillAddressFromProfile = (p: CustomerProfile | null) => {
        if (!p) return;
        const next = {
            street: p.addressLine1 || '',
            city: p.city || '',
            postalCode: p.postalCode || '',
            province: p.province || ''
        };
        setAddress(a => ({
            street: next.street || a.street || '',
            city: next.city || a.city || '',
            postalCode: next.postalCode || a.postalCode || '',
            province: next.province || a.province || ''
        }));
        setInitialAccountAddress(next);
    };

    const handleLogin = async (profile: CustomerProfile) => {
        setCustomer(profile);
        setIsAuthenticated(true);
        prefillAddressFromProfile(profile);
        // Persist successful login state and email for subsequent visits
        try {
            window.localStorage.setItem('checkoutEmail', email.trim());
            window.localStorage.setItem('checkoutIsAuthenticated', 'true');
            // Notify other components like header
            CartStore.emit();
        } catch {
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

        // If authenticated user edited address and opted in, update their account profile address
        if (needsShippingAddress && isAuthenticated && updateAccountAddress) {
            try {
                await registerOrUpdateCustomer({
                    email: email.trim(),
                    addressLine1: address.street,
                    city: address.city,
                    postalCode: address.postalCode,
                    province: address.province,
                });
                // snapshot becomes new initial to avoid repeated prompts
                setInitialAccountAddress({
                    street: address.street,
                    city: address.city,
                    postalCode: address.postalCode,
                    province: address.province,
                });
                setUpdateAccountAddress(false);
            } catch (e: any) {
                alert(typeof e?.message === 'string' ? e.message : 'Could not update your account address.');
                return;
            }
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
                await updateCustomerInformation({email}, sid);
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
                        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
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
    const navigate = useNavigate();

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

            // Update account address if opted in
            if (needsShippingAddress && isAuthenticated && updateAccountAddress) {
                try {
                    await registerOrUpdateCustomer({
                        email: email.trim(),
                        addressLine1: address.street,
                        city: address.city,
                        postalCode: address.postalCode,
                        province: address.province,
                    });
                    setInitialAccountAddress({
                        street: address.street,
                        city: address.city,
                        postalCode: address.postalCode,
                        province: address.province,
                    });
                    setUpdateAccountAddress(false);
                } catch (e: any) {
                    alert(typeof e?.message === 'string' ? e.message : 'Could not update your account address.');
                    setIsProcessing(false);
                    return;
                }
            }

            const sid = sessionId ?? CartStore.getOrderSessionId() ?? undefined;
            await updateCustomerInformation({email}, sid);
            // Set order status to IN_STORE_PAYMENT
            try {
                await apiUpdateOrderStatus(OrderStatus.IN_STORE_PAYMENT, sid);
            } catch (e) {
                console.warn('[In-Store] Failed to set order status to IN_STORE_PAYMENT:', e);
            }
            // Clear cart items from localStorage and update UI
            try {
                window.localStorage.removeItem('ec_cart_order_items');
            } catch (_) {
            }
            try {
                // CartStore.setFromOrder({ items: [] } as any);
                CartStore.clear();
                CartStore.resetAndNewSession();
            } catch (_) {
            }
            alert('Your order will be reserved for in-store payment. You can complete payment when you collect your items.');
            // Return to home screen
            navigate('/');
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
                        isAuthenticated={isAuthenticated}
                        returningChoice={returningChoice}
                        setReturningChoice={setReturningChoice}
                        handleLogin={handleLogin}
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
                        saveDetails={saveDetails}
                        setSaveDetails={setSaveDetails}
                        registerPassword={registerPassword}
                        setRegisterPassword={setRegisterPassword}
                        registerPasswordConfirm={registerPasswordConfirm}
                        setRegisterPasswordConfirm={setRegisterPasswordConfirm}
                        isAccountAddressEdited={isAccountAddressEdited}
                        updateAccountAddress={updateAccountAddress}
                        setUpdateAccountAddress={setUpdateAccountAddress}
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
                        className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {selectedPayment === 'IN_STORE' ? 'Reserve & Pay In-Store' : 'Complete Purchase'}
                    </button>
                </div>
            </div>

            <SaveConfirmModal
                show={showSaveConfirm}
                onClose={() => setShowSaveConfirm(false)}
                onConfirm={async () => {
                    await proceedInStoreCheckout();
                }}
                email={email}
                address={address}
                needsShippingAddress={needsShippingAddress}
                isProcessing={isProcessing}
            />
        </div>
    );
};

export default Checkout;
