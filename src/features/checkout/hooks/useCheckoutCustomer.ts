import {useCallback, useEffect, useMemo, useState} from 'react';

import {useQuery} from '@tanstack/react-query';

import {CHECKOUT_AUTH_STORAGE_KEY} from '@/features/checkout/utils/checkout.helpers.ts';
import {type CustomerProfile, lookupCustomer, registerOrUpdateCustomer} from '@/services/CustomerService.ts';
import {cartStore} from '@/store/storefrontCartStore.ts';

export type CheckoutAddress = {
    street: string;
    city: string;
    postalCode: string;
    province: string;
};

export type CheckoutCustomerState = {
    customer: CustomerProfile | null;
    isAuthenticated: boolean;
    lookupState: 'idle' | 'loading' | 'found' | 'not_found' | 'error';
    returningChoice: 'login' | 'guest' | null;
    setReturningChoice: (choice: 'login' | 'guest' | null) => void;
    address: CheckoutAddress;
    setAddress: (address: CheckoutAddress) => void;
    updateAccountAddress: boolean;
    setUpdateAccountAddress: (v: boolean) => void;
    isAccountAddressEdited: boolean;
    saveDetails: boolean;
    setSaveDetails: (v: boolean) => void;
    registerPassword: string;
    setRegisterPassword: (v: string) => void;
    registerPasswordConfirm: string;
    setRegisterPasswordConfirm: (v: string) => void;
    /** Called by Checkout when the customer completes login in the contact section. */
    handleLogin: (profile: CustomerProfile) => void;
    /**
     * Registers a new account if the guest chose to save their details.
     * Throws with a user-facing message on validation failure or API error.
     */
    registerIfChosen: (opts: { needsShippingAddress: boolean }) => Promise<void>;
    /**
     * Persists the current address back to the customer's account if they edited it.
     * Throws with a user-facing message on API error.
     */
    updateAddressIfRequired: (opts: { needsShippingAddress: boolean; email: string }) => Promise<void>;
};

type UseCheckoutCustomerInput = {
    /** Reactive email value from useCheckoutSession */
    email: string;
    /** Reactive validity flag from useCheckoutSession */
    emailValid: boolean;
    /**
     * Called after login to persist email + auth flag to localStorage.
     * Provided by useCheckoutSession.persistEmailSession.
     */
    onLoginPersist: (email: string) => void;
};

/**
 * Manages customer identity and address for the checkout flow.
 *
 * Responsibilities:
 *  - Looks up the customer by email whenever the email changes.
 *  - Restores the `isAuthenticated` flag from localStorage on mount.
 *  - Manages delivery address state and account address sync.
 *  - Handles new-account registration and address-update write-back.
 */
export function useCheckoutCustomer({
                                        email,
                                        emailValid,
                                        onLoginPersist,
                                    }: UseCheckoutCustomerInput): CheckoutCustomerState {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [returningChoice, setReturningChoice] = useState<'login' | 'guest' | null>(null);
    const [address, setAddress] = useState<CheckoutAddress>({street: '', city: '', postalCode: '', province: ''});
    const [initialAccountAddress, setInitialAccountAddress] = useState<CheckoutAddress | null>(null);
    const [updateAccountAddress, setUpdateAccountAddress] = useState(false);
    const [saveDetails, setSaveDetails] = useState(false);
    const [registerPassword, setRegisterPassword] = useState('');
    const [registerPasswordConfirm, setRegisterPasswordConfirm] = useState('');

    // Restore isAuthenticated from localStorage on mount
    useEffect(() => {
        try {
            if (window.localStorage.getItem(CHECKOUT_AUTH_STORAGE_KEY) === 'true') {
                setIsAuthenticated(true);
            }
        } catch { /* ignore */ }
    }, []);

    const prefillAddressFromProfile = useCallback((p: CustomerProfile) => {
        const next: CheckoutAddress = {
            street: p.physicalAddressLine1 || p.postalAddressLine1 || '',
            city: p.physicalCity || p.postalCity || '',
            postalCode: p.physicalPostalCode || p.postalPostalCode || '',
            province: p.physicalProvince || p.postalProvince || '',
        };
        setAddress((prev) => ({
            street: next.street || prev.street,
            city: next.city || prev.city,
            postalCode: next.postalCode || prev.postalCode,
            province: next.province || prev.province,
        }));
        setInitialAccountAddress(next);
    }, []);

    // Customer lookup — keyed on email, runs only when email is valid.
    const lookupQuery = useQuery({
        queryKey: ['customerLookup', email],
        queryFn: () => lookupCustomer(email.trim()),
        enabled: emailValid,
        staleTime: 1000 * 60 * 2,
    });

    // Reset returningChoice when email changes / becomes invalid
    useEffect(() => {
        if (!emailValid) setReturningChoice(null);
    }, [emailValid]);

    // Prefill address when an authenticated user's profile arrives
    useEffect(() => {
        const profile = lookupQuery.data;
        if (profile && isAuthenticated) prefillAddressFromProfile(profile);
    }, [lookupQuery.data, isAuthenticated, prefillAddressFromProfile]);

    const customer = lookupQuery.data ?? null;

    const lookupState = useMemo((): CheckoutCustomerState['lookupState'] => {
        if (!emailValid) return 'idle';
        if (lookupQuery.isFetching) return 'loading';
        if (lookupQuery.isError) return 'error';
        if (lookupQuery.isSuccess) return lookupQuery.data ? 'found' : 'not_found';
        return 'idle';
    }, [emailValid, lookupQuery.isFetching, lookupQuery.isError, lookupQuery.isSuccess, lookupQuery.data]);

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

    // Clear the address-update flag when it no longer applies
    useEffect(() => {
        if (!isAccountAddressEdited || !isAuthenticated) {
            setUpdateAccountAddress(false);
        }
    }, [isAccountAddressEdited, isAuthenticated]);

    const handleLogin = (profile: CustomerProfile) => {
        setCustomer(profile);
        setIsAuthenticated(true);
        prefillAddressFromProfile(profile);
        onLoginPersist(email);
        try {
            cartStore.emit();
        } catch { /* ignore */
        }
    };

    const registerIfChosen = async ({needsShippingAddress}: { needsShippingAddress: boolean }) => {
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
            physicalAddressLine1: address.street,
            physicalCity: address.city,
            physicalPostalCode: address.postalCode,
            physicalProvince: address.province,
            postalAddressLine1: address.street,
            postalCity: address.city,
            postalPostalCode: address.postalCode,
            postalProvince: address.province,
        });
    };

    const updateAddressIfRequired = async ({
                                               needsShippingAddress,
                                               email: currentEmail,
                                           }: {
        needsShippingAddress: boolean;
        email: string;
    }) => {
        if (!(needsShippingAddress && isAuthenticated && updateAccountAddress)) return;
        await registerOrUpdateCustomer({
            email: currentEmail.trim(),
            physicalAddressLine1: address.street,
            physicalCity: address.city,
            physicalPostalCode: address.postalCode,
            physicalProvince: address.province,
            postalAddressLine1: address.street,
            postalCity: address.city,
            postalPostalCode: address.postalCode,
            postalProvince: address.province,
        });
        // Only reached on success — commit the new address as the baseline
        setInitialAccountAddress({...address});
        setUpdateAccountAddress(false);
    };

    return {
        customer,
        isAuthenticated,
        lookupState,
        returningChoice,
        setReturningChoice,
        address,
        setAddress,
        updateAccountAddress,
        setUpdateAccountAddress,
        isAccountAddressEdited,
        saveDetails,
        setSaveDetails,
        registerPassword,
        setRegisterPassword,
        registerPasswordConfirm,
        setRegisterPasswordConfirm,
        handleLogin,
        registerIfChosen,
        updateAddressIfRequired,
    };
}
