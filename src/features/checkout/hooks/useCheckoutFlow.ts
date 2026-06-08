import {useMemo, useState} from 'react';
import {useCheckoutCustomer} from '@/features/checkout/hooks/useCheckoutCustomer.ts';
import {useCheckoutSession} from '@/features/checkout/hooks/useCheckoutSession.ts';
import {useCheckoutSubmit} from '@/features/checkout/hooks/useCheckoutSubmit.ts';
import {usePaymentMethodsConfig} from '@/features/checkout/hooks/usePaymentMethodsConfig.ts';
import {useShippingMethods} from '@/features/checkout/hooks/useShippingMethods.ts';
import {isInStorePickup} from '@/features/checkout/utils/checkout.helpers.ts';
import type {CheckoutTenantCallbacks} from '@/features/checkout/types.ts';
import {calculateVatFromExclusive} from "@/utils/vat.ts"; // Import calculateVatFromExclusive

/**
 * Composes the three focused checkout hooks into the single public API consumed by
 * Checkout.tsx. Each sub-hook owns a distinct concern:
 *
 *  - useCheckoutSession  → email state, localStorage persistence, order hydration
 *  - useCheckoutCustomer → customer lookup, address management, registration
 *  - useCheckoutSubmit   → in-store + PayFast submit handlers, submitDisabled guard
 *
 * Shipping/payment config and the derived shipping-address flag live here because
 * they depend on both shipping methods (external) and selected method (local state).
 */
export function useCheckoutFlow(callbacks: CheckoutTenantCallbacks) {
    const {shippingMethods} = useShippingMethods();
    const {paymentConfig, enabledPayments, selectedPayment, setSelectedPayment} = usePaymentMethodsConfig();
    const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null);

    const session = useCheckoutSession();

    const customerCtx = useCheckoutCustomer({
        email: session.email,
        emailValid: session.emailValid,
        onLoginPersist: session.persistEmailSession,
    });

    // Derived from shipping selection — needed by both customer and submit hooks
    const needsShippingAddress = useMemo(() => {
        const selected = shippingMethods.find((m) => m.id === selectedMethodId);
        return !!selected && !isInStorePickup(selected.name);
    }, [selectedMethodId, shippingMethods]);

    const selectedShipping = useMemo(
        () => shippingMethods.find((m) => m.id === selectedMethodId) ?? null,
        [selectedMethodId, shippingMethods],
    );

    const shippingFee = useMemo(() => Number(selectedShipping?.baseFee ?? 0), [selectedShipping]);
    const vatAmount = useMemo(() => calculateVatFromExclusive(session.itemsTotal).vatAmount, [session.itemsTotal]); // Calculate VAT based on itemsTotal
    const grandTotal = useMemo(() => session.itemsTotal + shippingFee + vatAmount, [session.itemsTotal, shippingFee, vatAmount]); // Include VAT in grandTotal

    const submit = useCheckoutSubmit({
        // Session
        email: session.email,
        emailValid: session.emailValid,
        setEmailTouched: session.setEmailTouched,
        sessionId: session.sessionId,
        order: session.order,
        clearEmailSession: session.clearEmailSession,
        // Customer
        needsShippingAddress,
        customer: customerCtx.customer,
        isAuthenticated: customerCtx.isAuthenticated,
        returningChoice: customerCtx.returningChoice,
        saveDetails: customerCtx.saveDetails,
        registerPassword: customerCtx.registerPassword,
        registerPasswordConfirm: customerCtx.registerPasswordConfirm,
        address: customerCtx.address,
        registerIfChosen: customerCtx.registerIfChosen,
        updateAddressIfRequired: customerCtx.updateAddressIfRequired,
        // Payment / shipping
        selectedPayment,
        selectedMethodId,
        // Tenant
        callbacks,
    });

    return {
        // Shipping
        shippingMethods,
        selectedMethodId,
        setSelectedMethodId,
        needsShippingAddress,
        selectedShipping,
        shippingFee,
        // VAT
        vatAmount, // Export vatAmount
        grandTotal,
        // Payment
        paymentConfig,
        enabledPayments,
        selectedPayment,
        setSelectedPayment,
        // Session
        email: session.email,
        setEmail: session.setEmail,
        emailValid: session.emailValid,
        emailTouched: session.emailTouched,
        setEmailTouched: session.setEmailTouched,
        order: session.order,
        loading: session.loading,
        error: session.error,
        itemsTotal: session.itemsTotal,
        // Customer
        customer: customerCtx.customer,
        isAuthenticated: customerCtx.isAuthenticated,
        lookupState: customerCtx.lookupState,
        returningChoice: customerCtx.returningChoice,
        setReturningChoice: customerCtx.setReturningChoice,
        address: customerCtx.address,
        setAddress: customerCtx.setAddress,
        updateAccountAddress: customerCtx.updateAccountAddress,
        setUpdateAccountAddress: customerCtx.setUpdateAccountAddress,
        isAccountAddressEdited: customerCtx.isAccountAddressEdited,
        saveDetails: customerCtx.saveDetails,
        setSaveDetails: customerCtx.setSaveDetails,
        registerPassword: customerCtx.registerPassword,
        setRegisterPassword: customerCtx.setRegisterPassword,
        registerPasswordConfirm: customerCtx.registerPasswordConfirm,
        setRegisterPasswordConfirm: customerCtx.setRegisterPasswordConfirm,
        handleLogin: customerCtx.handleLogin,
        // Submit
        isProcessing: submit.isProcessing,
        showSaveConfirm: submit.showSaveConfirm,
        setShowSaveConfirm: submit.setShowSaveConfirm,
        submitDisabled: submit.submitDisabled,
        proceedInStoreCheckout: submit.proceedInStoreCheckout,
        handleInStoreCheckout: submit.handleInStoreCheckout,
        handlePayFastCheckout: submit.handlePayFastCheckout,
    };
}