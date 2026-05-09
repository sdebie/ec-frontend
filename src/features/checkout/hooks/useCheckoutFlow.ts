import { useEffect, useMemo, useState } from 'react';


import { OrderStatus } from '@/constants/enums/OrderStatus.ts';
import { usePaymentMethodsConfig } from '@/features/checkout/hooks/usePaymentMethodsConfig.ts';
import { useShippingMethods } from '@/features/checkout/hooks/useShippingMethods.ts';
import {
    fetchPayfastCheckoutFields,
    PAYFAST_SANDBOX_GATEWAY_URL,
    submitPayfastRedirectForm,
} from '@/features/checkout/services/checkout.api.ts';
import { isInStorePickup } from '@/features/checkout/utils/checkout.helpers.ts';
import {
    type CustomerProfile,
    lookupCustomer,
    registerOrUpdateCustomer,
    updateCustomerInformation,
} from '@/services/CustomerService.ts';
import { apiOrderById, apiOrderBySessionId, apiUpdateOrderStatus } from '@/services/graphql/order/OrderService.graphql.ts';
import { cartStore } from '@/store/storefrontCartStore.ts';
import { getCartItemsStorageKey } from '@/utils/storefront/tenantStorageKeys';

import type { CheckoutTenantCallbacks } from '@/features/checkout/types.ts';
import type { OrderData } from '@/types/order.types.ts';

function resolveSessionId(urlSessionId: string | undefined): string | undefined {
    return urlSessionId ?? cartStore.getOrderSessionId() ?? undefined;
}

export function useCheckoutFlow(callbacks: CheckoutTenantCallbacks) {
    const { shippingMethods } = useShippingMethods();
    const { paymentConfig, enabledPayments, selectedPayment, setSelectedPayment } = usePaymentMethodsConfig();

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
            /* ignore */
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
        void run();
        return () => {
            cancelled = true;
        };
    }, [emailValid, email, needsShippingAddress, isAuthenticated]);

    const { sessionId, orderId } = useMemo(() => {
        const params = new URLSearchParams(window.location.search);
        return {
            sessionId: params.get('sessionId') ?? undefined,
            orderId: params.get('orderId') ?? undefined,
        };
    }, []);

    useEffect(() => {
        const load = async () => {
            const sid = resolveSessionId(sessionId);
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
                const orderEmail = data?.customer?.email?.trim();
                if (orderEmail) {
                    setEmail(orderEmail);
                }
                cartStore.setFromOrder(data ?? null);
            } catch (e: unknown) {
                console.error('Failed to fetch order', e);
                setError(e instanceof Error ? e.message : 'Failed to fetch order');
            } finally {
                setLoading(false);
            }
        };
        void load();
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
            cartStore.emit();
        } catch {
            /* ignore */
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

    const proceedInStoreCheckout = async () => {
        try {
            setIsProcessing(true);
            try {
                await registerIfChosen();
            } catch (e: unknown) {
                alert(typeof (e as Error)?.message === 'string' ? (e as Error).message : 'Please check your details.');
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
                    setInitialAccountAddress({ ...address });
                    setUpdateAccountAddress(false);
                } catch (e: unknown) {
                    alert(typeof (e as Error)?.message === 'string' ? (e as Error).message : 'Could not update your account address.');
                    setIsProcessing(false);
                    return;
                }
            }

            const sid = resolveSessionId(sessionId);
            if (!sid) {
                alert('Missing checkout session. Please return from the cart and try again.');
                setIsProcessing(false);
                return;
            }

            await updateCustomerInformation({ email }, sid);
            try {
                await apiUpdateOrderStatus(OrderStatus.IN_STORE_PAYMENT, sid);
            } catch (e) {
                console.warn('[In-Store] Failed to set order status to IN_STORE_PAYMENT:', e);
            }
            try {
                window.localStorage.removeItem(getCartItemsStorageKey());
            } catch {
                /* ignore */
            }
            try {
                cartStore.clear();
                cartStore.resetAndNewSession();
            } catch {
                /* ignore */
            }
            alert('Your order will be reserved for in-store payment. You can complete payment when you collect your items.');
            callbacks.onInStoreOrder();
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
        } catch (e: unknown) {
            alert(typeof (e as Error)?.message === 'string' ? (e as Error).message : 'Please check your details.');
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
                setInitialAccountAddress({ ...address });
                setUpdateAccountAddress(false);
            } catch (e: unknown) {
                alert(typeof (e as Error)?.message === 'string' ? (e as Error).message : 'Could not update your account address.');
                return;
            }
        }

        try {
            setIsProcessing(true);
            const sid = resolveSessionId(sessionId);
            if (!sid) {
                alert('Missing checkout session. Please return from the cart and try again.');
                setIsProcessing(false);
                return;
            }

            try {
                await updateCustomerInformation({ email }, sid);
            } catch (e) {
                console.error('[PayFast] Failed to update customer information:', e);
                alert('Could not save your email address to the order. Please try again.');
                setIsProcessing(false);
                return;
            }

            if (!order || !order.id || order.totalAmount == null) {
                alert('Order details are not loaded');
                setIsProcessing(false);
                return;
            }

            try {
                const fields = await fetchPayfastCheckoutFields(String(order.id), Number(order.totalAmount));
                submitPayfastRedirectForm(fields, PAYFAST_SANDBOX_GATEWAY_URL);
            } catch (e) {
                console.error('[PayFast] Checkout initiation failed:', e);
                alert('Could not initiate payment. Please try again.');
                setIsProcessing(false);
            }
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

    return {
        shippingMethods,
        paymentConfig,
        enabledPayments,
        selectedPayment,
        setSelectedPayment,
        selectedMethodId,
        setSelectedMethodId,
        address,
        setAddress,
        updateAccountAddress,
        setUpdateAccountAddress,
        customer,
        isAuthenticated,
        saveDetails,
        setSaveDetails,
        registerPassword,
        setRegisterPassword,
        registerPasswordConfirm,
        setRegisterPasswordConfirm,
        lookupState,
        returningChoice,
        setReturningChoice,
        showSaveConfirm,
        setShowSaveConfirm,
        isProcessing,
        order,
        loading,
        error,
        email,
        setEmail,
        emailValid,
        emailTouched,
        setEmailTouched,
        itemsTotal,
        selectedShipping,
        shippingFee,
        grandTotal,
        needsShippingAddress,
        isAccountAddressEdited,
        handleLogin,
        proceedInStoreCheckout,
        handleInStoreCheckout,
        handlePayFastCheckout,
        submitDisabled,
    };
}
