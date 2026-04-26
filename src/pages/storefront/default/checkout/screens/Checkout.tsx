import React, {useEffect, useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {apiOrderById, apiOrderBySessionId, apiUpdateOrderStatus} from '@/services/graphql/order/OrderService.graphql.ts';
import type {OrderData} from '@/types/order.types.ts';
import {CartStore} from '@/store/CartStore.ts';
import {
    fetchPaymentMethodsConfig,
    type PaymentMethodInfo,
    type PaymentMethodKey,
    type PaymentMethodsConfig,
    type ShippingMethod,
} from '@/services/StoreSettings.ts';
import {
    type CustomerProfile,
    lookupCustomer,
    registerOrUpdateCustomer,
    updateCustomerInformation,
} from '@/services/CustomerService.ts';
import {apiGetShippingMethods} from '@/services/graphql/admin/settings/SettingsService.graphql.ts';
import {OrderStatus} from '@/constants/enums/OrderStatus.ts';
import ContactInformationSection from '../components/ContactInformationSection.tsx';
import ShippingMethodSection from '../components/ShippingMethodSection.tsx';
import PaymentMethodSection from '../components/PaymentMethodSection.tsx';
import OrderSummary from '../components/OrderSummary.tsx';
import CheckoutSubmitBar from '../components/CheckoutSubmitBar.tsx';
import SaveConfirmModal from '../components/SaveConfirmModal.tsx';
import {isInStorePickup} from '../components/helpers.ts';

interface HtmlFormField {
    type: string;
    name: string;
    value: string;
}

const gatewayPath = 'https://sandbox.payfast.co.za/eng/process';

const Checkout: React.FC = () => {
    const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
    const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null);
    const [address, setAddress] = useState({
        street: '',
        city: '',
        postalCode: '',
        province: '',
    });
    const [initialAccountAddress, setInitialAccountAddress] = useState<{
        street: string;
        city: string;
        postalCode: string;
        province: string;
    } | null>(null);
    const [updateAccountAddress, setUpdateAccountAddress] = useState<boolean>(false);

    const [customer, setCustomer] = useState<CustomerProfile | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [saveDetails, setSaveDetails] = useState<boolean>(false);
    const [registerPassword, setRegisterPassword] = useState<string>('');
    const [registerPasswordConfirm, setRegisterPasswordConfirm] = useState<string>('');
    const [lookupState, setLookupState] = useState<'idle' | 'loading' | 'found' | 'not_found' | 'error'>('idle');
    const [returningChoice, setReturningChoice] = useState<'login' | 'guest' | null>(null);
    const [showSaveConfirm, setShowSaveConfirm] = useState<boolean>(false);

    const [paymentConfig, setPaymentConfig] = useState<PaymentMethodsConfig>({});
    const [enabledPayments, setEnabledPayments] = useState<PaymentMethodKey[]>([]);
    const [selectedPayment, setSelectedPayment] = useState<PaymentMethodKey | null>(null);

    const [isProcessing, setIsProcessing] = useState(false);
    const [order, setOrder] = useState<OrderData | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const [email, setEmail] = useState<string>('');
    const [emailTouched, setEmailTouched] = useState<boolean>(false);

    const emailValid = useMemo(() => {
        if (!email) return false;
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }, [email]);

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const methods = await apiGetShippingMethods();
                setShippingMethods((methods || []).filter((m) => (m.active ?? true) && !!m.id));
            } catch (e) {
                console.warn('Failed to load shipping methods', e);
                setShippingMethods([]);
            }

            try {
                const cfg = await fetchPaymentMethodsConfig();
                setPaymentConfig(cfg);
                const keys = Object.entries(cfg)
                    .filter(([_, info]) => !!info && (info as PaymentMethodInfo).enabled)
                    .map(([key]) => key as PaymentMethodKey);
                setEnabledPayments(keys);
                setSelectedPayment((prev) => prev ?? (keys[0] || null));
            } catch (e) {
                console.warn('Failed to load payment methods', e);
                setPaymentConfig({});
                setEnabledPayments([]);
                setSelectedPayment(null);
            }
        };

        loadSettings();
    }, []);

    const needsShippingAddress = useMemo(() => {
        const selected = shippingMethods.find((m) => m.id === selectedMethodId);
        return !!selected && !isInStorePickup(selected?.name);
    }, [selectedMethodId, shippingMethods]);

    useEffect(() => {
        try {
            const savedEmail = window.localStorage.getItem('checkoutEmail') || '';
            const savedAuth = window.localStorage.getItem('checkoutIsAuthenticated') === 'true';
            if (savedEmail) setEmail(savedEmail);
            if (savedAuth) setIsAuthenticated(true);
        } catch {
        }
    }, []);

    const prefillAddressFromProfile = (p: CustomerProfile | null) => {
        if (!p) return;
        const next = {
            street: p.addressLine1 || '',
            city: p.city || '',
            postalCode: p.postalCode || '',
            province: p.province || '',
        };
        setAddress((a) => ({
            street: next.street || a.street || '',
            city: next.city || a.city || '',
            postalCode: next.postalCode || a.postalCode || '',
            province: next.province || a.province || '',
        }));
        setInitialAccountAddress(next);
    };

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
                setReturningChoice(null);
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
                    const d = await apiOrderBySessionId(sid);
                    data = d ?? null;
                } else if (orderId) {
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

    const itemsTotal = useMemo(() => {
        const items = order?.items ?? [];
        return items.reduce((sum, it) => sum + Number(it.unitPrice || 0) * Number(it.quantity || 0), 0);
    }, [order]);

    const selectedShipping = useMemo(() => {
        return shippingMethods.find((m) => m.id === selectedMethodId) || null;
    }, [selectedMethodId, shippingMethods]);

    const shippingFee = useMemo(() => Number(selectedShipping?.baseFee || 0), [selectedShipping]);
    const grandTotal = useMemo(() => itemsTotal + shippingFee, [itemsTotal, shippingFee]);

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

    useEffect(() => {
        if (!isAccountAddressEdited || !isAuthenticated) {
            setUpdateAccountAddress(false);
        }
    }, [isAccountAddressEdited, isAuthenticated]);

    const handleLogin = async (profile: CustomerProfile) => {
        setCustomer(profile);
        setIsAuthenticated(true);
        prefillAddressFromProfile(profile);
        try {
            window.localStorage.setItem('checkoutEmail', email.trim());
            window.localStorage.setItem('checkoutIsAuthenticated', 'true');
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
            province: address.province,
        });
    };

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

            if (needsShippingAddress && isAuthenticated && updateAccountAddress) {
                try {
                    await registerOrUpdateCustomer({
                        email: email.trim(),
                        addressLine1: address.street,
                        city: address.city,
                        postalCode: address.postalCode,
                        province: address.province,
                    });
                    setInitialAccountAddress({...address});
                    setUpdateAccountAddress(false);
                } catch (e: any) {
                    alert(typeof e?.message === 'string' ? e.message : 'Could not update your account address.');
                    setIsProcessing(false);
                    return;
                }
            }

            const sid = sessionId ?? CartStore.getOrderSessionId() ?? undefined;
            await updateCustomerInformation({email}, sid);
            try {
                await apiUpdateOrderStatus(OrderStatus.IN_STORE_PAYMENT, sid);
            } catch (e) {
                console.warn('[In-Store] Failed to set order status to IN_STORE_PAYMENT:', e);
            }
            try {
                window.localStorage.removeItem('ec_cart_order_items');
            } catch {
            }
            try {
                CartStore.clear();
                CartStore.resetAndNewSession();
            } catch {
            }
            alert('Your order will be reserved for in-store payment. You can complete payment when you collect your items.');
            navigate('/');
        } catch (e) {
            console.error('[In-Store] Failed to update customer information:', e);
            alert('Could not save your email address to the order. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleInStoreCheckout = async () => {
        if (!emailValid) {
            setEmailTouched(true);
            alert('Please enter a valid email address before continuing.');
            return;
        }
        if (needsShippingAddress && saveDetails) {
            setShowSaveConfirm(true);
            return;
        }
        await proceedInStoreCheckout();
    };

    const handlePayFastCheckout = async () => {
        if (!emailValid) {
            setEmailTouched(true);
            alert('Please enter a valid email address before continuing.');
            return;
        }
        if (needsShippingAddress && customer && customer.hasPassword && returningChoice === 'login' && !isAuthenticated) {
            alert('Please sign in to use your saved address or choose "Continue as guest".');
            return;
        }

        try {
            await registerIfChosen();
        } catch (e: any) {
            alert(typeof e?.message === 'string' ? e.message : 'Please check your details.');
            return;
        }

        if (needsShippingAddress && isAuthenticated && updateAccountAddress) {
            try {
                await registerOrUpdateCustomer({
                    email: email.trim(),
                    addressLine1: address.street,
                    city: address.city,
                    postalCode: address.postalCode,
                    province: address.province,
                });
                setInitialAccountAddress({...address});
                setUpdateAccountAddress(false);
            } catch (e: any) {
                alert(typeof e?.message === 'string' ? e.message : 'Could not update your account address.');
                return;
            }
        }

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

            // @ts-ignore
            form._submit_function_ = form.submit;
            document.body.appendChild(form);
            // @ts-ignore
            if (typeof form._submit_function_ === 'function') form._submit_function_();
            else form.submit();
        };

        try {
            setIsProcessing(true);
            try {
                const sid = sessionId ?? CartStore.getOrderSessionId() ?? undefined;
                await updateCustomerInformation({email}, sid);
            } catch (e) {
                console.error('[PayFast] Failed to update customer information:', e);
                alert('Could not save your email address to the order. Please try again.');
                setIsProcessing(false);
                return;
            }

            const isLocalHost =
                window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            const apiBases = isLocalHost
                ? ['http://localhost:8080', 'http://127.0.0.1:8080']
                : ['https://ecapi.sdebiehome.co.za'];

            let lastErr: any = null;
            let response: Response | null = null;

            for (const base of apiBases) {
                try {
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

                    break;
                } catch (e) {
                    lastErr = e;
                    response = null;
                }
            }

            if (!response) throw lastErr || new Error('No response from any API base');

            let fields: HtmlFormField[] = [];
            try {
                fields = (await response.json()) as HtmlFormField[];
            } catch {
                const txt = await response.text().catch(() => '');
                throw new Error('Failed to parse JSON for /api/payments/checkout. Body: ' + txt);
            }

            buildAndSubmitGatewayForm(fields);
        } catch (e) {
            console.error('[PayFast] Checkout initiation failed:', e);
            alert('Could not initiate payment. Please try again.');
            setIsProcessing(false);
        }
    };

    const submitDisabled =
        !emailValid ||
        !selectedMethodId ||
        (needsShippingAddress && !address.street) ||
        !selectedPayment ||
        (needsShippingAddress && customer && customer.hasPassword && returningChoice === 'login' && !isAuthenticated) ||
        (needsShippingAddress &&
            saveDetails &&
            (!registerPassword || registerPassword.length < 6 || registerPassword !== registerPasswordConfirm));

    return (
        <>
            <div className="min-h-screen bg-(--sf-bg)">
                <div
                    className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 px-4 py-8 sm:px-6 lg:grid-cols-12 lg:gap-10 lg:px-8">
                    <main className="space-y-6 lg:col-span-7">
                        <ContactInformationSection
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

                        <ShippingMethodSection
                            shippingMethods={shippingMethods}
                            selectedMethodId={selectedMethodId}
                            setSelectedMethodId={setSelectedMethodId}
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

                        <PaymentMethodSection
                            enabledPayments={enabledPayments}
                            paymentConfig={paymentConfig}
                            selectedPayment={selectedPayment}
                            setSelectedPayment={setSelectedPayment}
                        />
                    </main>
                    <aside className="space-y-4 lg:col-span-5 lg:sticky lg:top-8 lg:self-start">
                        <OrderSummary
                            order={order}
                            loading={loading}
                            error={error}
                            itemsTotal={itemsTotal}
                            selectedShipping={selectedShipping}
                            shippingFee={shippingFee}
                            grandTotal={grandTotal}
                        />
                        <CheckoutSubmitBar
                            disabled={submitDisabled}
                            selectedPayment={selectedPayment}
                            onInStoreCheckout={handleInStoreCheckout}
                            onPayFastCheckout={handlePayFastCheckout}
                        />
                    </aside>
                </div>
            </div>

            <SaveConfirmModal
                show={showSaveConfirm}
                onClose={() => setShowSaveConfirm(false)}
                onConfirm={proceedInStoreCheckout}
                email={email}
                address={address}
                needsShippingAddress={needsShippingAddress}
                isProcessing={isProcessing}
            />
        </>
    );
};

export default Checkout;


