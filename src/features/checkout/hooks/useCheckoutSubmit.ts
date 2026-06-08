import {useState} from 'react';

import {useMutation} from '@tanstack/react-query';
import {OrderStatus} from '@/constants/enums/OrderStatus.ts';
import {
    fetchPayfastCheckoutFields,
    PAYFAST_SANDBOX_GATEWAY_URL,
    submitPayfastRedirectForm,
} from '@/features/checkout/services/checkout.api.ts';
import {resolveCheckoutSessionId} from '@/features/checkout/utils/checkout.helpers.ts';
import {updateCustomerInformation} from '@/services/CustomerService.ts';
import {apiUpdateOrderStatus} from '@/services/graphql/order/OrderService.graphql.ts';
import type {CheckoutAddress, CheckoutCustomerState} from '@/features/checkout';
import type {CheckoutTenantCallbacks} from '../types.ts';
import type {PaymentMethodKey} from '@/services/StoreSettings.ts';
import type {OrderData} from '@/types/order.types.ts';

type UseCheckoutSubmitInput = {
    // ── Session ─────────────────────────────────────────────────────────────
    email: string;
    emailValid: boolean;
    setEmailTouched: (v: boolean) => void;
    /** Raw URL session param — resolved to the real session ID inside each handler */
    sessionId: string | undefined;
    order: OrderData | null;
    clearEmailSession: () => void;

    // ── Customer / address ───────────────────────────────────────────────────
    needsShippingAddress: boolean;
    customer: CheckoutCustomerState['customer'];
    isAuthenticated: boolean;
    returningChoice: CheckoutCustomerState['returningChoice'];
    saveDetails: boolean;
    registerPassword: string;
    registerPasswordConfirm: string;
    address: CheckoutAddress;
    registerIfChosen: CheckoutCustomerState['registerIfChosen'];
    updateAddressIfRequired: CheckoutCustomerState['updateAddressIfRequired'];

    // ── Payment / shipping ───────────────────────────────────────────────────
    selectedPayment: PaymentMethodKey | null;
    selectedMethodId: string | null;

    // ── Tenant ───────────────────────────────────────────────────────────────
    callbacks: CheckoutTenantCallbacks;
};

export type CheckoutSubmitState = {
    isProcessing: boolean;
    showSaveConfirm: boolean;
    setShowSaveConfirm: (v: boolean) => void;
    submitDisabled: boolean;
    proceedInStoreCheckout: () => Promise<void>;
    handleInStoreCheckout: () => Promise<void>;
    handlePayFastCheckout: () => Promise<void>;
};

/**
 * Manages checkout submission for both in-store and PayFast payment paths.
 *
 * Responsibilities:
 *  - Guards submission with email/address/payment validation.
 *  - Triggers guest registration and account-address write-back before submitting.
 *  - Calls the appropriate gateway (in-store order status update vs. PayFast redirect).
 *  - Clears the session and notifies the tenant via callbacks on success.
 */
export function useCheckoutSubmit({
                                      email,
                                      emailValid,
                                      setEmailTouched,
                                      sessionId,
                                      order,
                                      clearEmailSession,
                                      needsShippingAddress,
                                      customer,
                                      isAuthenticated,
                                      returningChoice,
                                      saveDetails,
                                      registerPassword,
                                      registerPasswordConfirm,
                                      address,
                                      registerIfChosen,
                                      updateAddressIfRequired,
                                      selectedPayment,
                                      selectedMethodId,
                                      callbacks,
                                  }: UseCheckoutSubmitInput): CheckoutSubmitState {
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);

    // ── Shared pre-submit steps ──────────────────────────────────────────────

    /** Run registration + address update. Returns false if an error was shown. */
    const runPreSubmitSteps = async (): Promise<boolean> => {
        try {
            await registerIfChosen({needsShippingAddress});
        } catch (e: unknown) {
            alert(e instanceof Error ? e.message : 'Please check your details.');
            return false;
        }
        try {
            await updateAddressIfRequired({needsShippingAddress, email});
        } catch (e: unknown) {
            alert(e instanceof Error ? e.message : 'Could not update your account address.');
            return false;
        }
        return true;
    };

    // ── In-store mutation ────────────────────────────────────────────────────

    const inStoreMutation = useMutation({
        mutationFn: async () => {
            if (!(await runPreSubmitSteps())) return;

            const sid = resolveCheckoutSessionId(sessionId);
            if (!sid) {
                alert('Missing checkout session. Please return from the cart and try again.');
                return;
            }

            await updateCustomerInformation({email}, sid);

            try {
                await apiUpdateOrderStatus(OrderStatus.IN_STORE_PAYMENT, sid);
            } catch (e) {
                console.warn('[In-Store] Failed to set order status to IN_STORE_PAYMENT:', e);
            }

            clearEmailSession();
            alert('Your order will be reserved for in-store payment. You can complete payment when you collect your items.');
            callbacks.onInStoreOrder();
        },
        onError: (e) => {
            console.error('[In-Store] Failed to update customer information:', e);
            alert('Could not save your email address to the order. Please try again.');
        },
    });

    const proceedInStoreCheckout = () => { inStoreMutation.mutate(); };

    const handleInStoreCheckout = async () => {
        if (!emailValid) {
            setEmailTouched(true);
            alert('Please enter a valid email address before continuing.');
            return;
        }
        // Guest chose to save details → confirm address before committing
        if (needsShippingAddress && saveDetails) {
            setShowSaveConfirm(true);
            return;
        }
        inStoreMutation.mutate();
    };

    // ── PayFast mutation ─────────────────────────────────────────────────────

    const payFastMutation = useMutation({
        mutationFn: async () => {
            const sid = resolveCheckoutSessionId(sessionId);
            if (!sid) {
                alert('Missing checkout session. Please return from the cart and try again.');
                return;
            }

            try {
                await updateCustomerInformation({email}, sid);
            } catch (e) {
                console.error('[PayFast] Failed to update customer information:', e);
                alert('Could not save your email address to the order. Please try again.');
                return;
            }

            if (!order?.id || order.totalAmount == null) {
                alert('Order details are not loaded. Please try again.');
                return;
            }

            try {
                const fields = await fetchPayfastCheckoutFields(String(order.id), Number(order.totalAmount));
                submitPayfastRedirectForm(fields, PAYFAST_SANDBOX_GATEWAY_URL);
            } catch (e) {
                console.error('[PayFast] Checkout initiation failed:', e);
                alert('Could not initiate payment. Please try again.');
            }
        },
        onError: (e) => {
            console.error('[PayFast] Unexpected error:', e);
            alert('Could not initiate payment. Please try again.');
        },
    });

    const handlePayFastCheckout = async () => {
        if (!emailValid) {
            setEmailTouched(true);
            alert('Please enter a valid email address before continuing.');
            return;
        }
        if (needsShippingAddress && customer?.hasPassword && returningChoice === 'login' && !isAuthenticated) {
            alert('Please sign in to use your saved address or choose "Continue as guest".');
            return;
        }
        // Pre-submit validation (registration/address) runs before mutate() so
        // failures abort the flow cleanly before the spinner starts.
        if (!(await runPreSubmitSteps())) return;
        payFastMutation.mutate();
    };

    // ── Submit guard ─────────────────────────────────────────────────────────

    const submitDisabled =
        !emailValid ||
        !selectedMethodId ||
        !selectedPayment ||
        (needsShippingAddress && !address.street) ||
        (needsShippingAddress && !!customer?.hasPassword && returningChoice === 'login' && !isAuthenticated) ||
        (needsShippingAddress &&
            saveDetails &&
            (!registerPassword || registerPassword.length < 6 || registerPassword !== registerPasswordConfirm));

    return {
        isProcessing: inStoreMutation.isPending || payFastMutation.isPending,
        showSaveConfirm,
        setShowSaveConfirm,
        submitDisabled,
        proceedInStoreCheckout,
        handleInStoreCheckout,
        handlePayFastCheckout,
    };
}
