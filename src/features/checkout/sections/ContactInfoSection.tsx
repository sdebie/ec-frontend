import React from 'react';

import { CustomerType } from '@/constants/enums/CustomerType.ts';
import {CustomerStatus} from "@/constants/enums/CustomerStatus.ts";
import type { CustomerProfile } from '@/services/CustomerService.ts';

export type LookupState = 'idle' | 'loading' | 'found' | 'not_found' | 'error';

type Props = {
    email: string;
    setEmail: (value: string) => void;
    emailValid: boolean;
    emailTouched: boolean;
    setEmailTouched: (value: boolean) => void;
    lookupState: LookupState;
    customer: CustomerProfile | null;
    isAuthenticated: boolean;
    returningChoice: 'login' | 'guest' | null;
    setReturningChoice: (value: 'login' | 'guest' | null) => void;
    loginSlot?: React.ReactNode;
};

const ContactInfoSection: React.FC<Props> = ({
    email,
    setEmail,
    emailValid,
    emailTouched,
    setEmailTouched,
    lookupState,
    customer,
    isAuthenticated,
    returningChoice,
    setReturningChoice,
    loginSlot,
}) => {
    const showReturningBlock =
        !!customer &&
        !!customer.hasPassword &&
        customer.shopperType?.toUpperCase() !== 'GUEST' &&
        customer.status?.toUpperCase() !== 'PENDING' &&
        !isAuthenticated &&
        emailValid &&
        lookupState === 'found';

    return (
        <>
            <div>
                <h2 className="text-lg font-medium text-(--sf-text)">Contact information</h2>
                <div className="mt-4">
                    <label htmlFor="email-address" className="block text-sm/6 font-medium text-(--sf-text)">
                        Email address
                    </label>
                    <div className="mt-2">
                        <input
                            id="email-address"
                            name="email-address"
                            type="email"
                            autoComplete="email"
                            disabled={isAuthenticated}
                            onBlur={() => setEmailTouched(true)}
                            onChange={(e) => setEmail(e.target.value)}
                            className={`block w-full rounded-md bg-(--sf-panel) px-3 py-2 text-base text-(--sf-text) outline-1 -outline-offset-1 outline-(--sf-border) placeholder:text-(--sf-muted-text) focus:outline-2 focus:-outline-offset-2 focus:outline-(--sf-accent) sm:text-sm/6
                            ${
                                isAuthenticated
                                    ? 'cursor-not-allowed bg-(--sf-bg) text-(--sf-muted-text)'
                                    : 'border-(--sf-border) focus:border-(--sf-accent) focus:ring-1 focus:ring-(--sf-accent)'
                            }`}
                        />
                        {email && !emailValid && emailTouched && (
                            <p className="mt-1 text-xs text-(--sf-error)">Please enter a valid email address.</p>
                        )}

                        {isAuthenticated && (
                            <p className="mt-1 text-xs text-(--sf-error)">Auth.</p>
                        )}

                        {emailValid && (
                            <div className="mt-1 text-xs">
                                {isAuthenticated ? (
                                    <span className="inline-flex rounded-md border border-green-200 bg-green-50 px-2 py-1 text-green-700">
                                        Welcome back{customer?.firstName ? `, ${customer.firstName}` : ''}.
                                    </span>
                                ) : (
                                    <>
                                        {lookupState === 'loading' && (
                                            <span className="text-(--sf-muted-text)">Checking account...</span>
                                        )}
                                        {lookupState === 'found' &&
                                            customer?.status?.toUpperCase() !== CustomerStatus.ACTIVE.toUpperCase() && (
                                                <span className="inline-flex rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-blue-700">
                                                    Account not active for {customer.email} - continuing as guest
                                                </span>
                                            )}
                                        {lookupState === 'found' &&
                                            customer?.shopperType?.toUpperCase() === CustomerType.GUEST.toUpperCase() && (
                                                <span className="inline-flex rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-blue-700">
                                                    Continuing as guest
                                                </span>
                                            )}
                                        {lookupState === 'not_found' && (
                                            <span className="inline-flex rounded-md border border-green-200 bg-green-50 px-2 py-1 text-green-700">
                                                No account found - continuing as guest
                                            </span>
                                        )}
                                        {lookupState === 'error' && (
                                            <span className="inline-flex rounded-md border border-yellow-200 bg-yellow-50 px-2 py-1 text-yellow-700">
                                                Could not check account right now.
                                            </span>
                                        )}
                                    </>
                                )}
                            </div>
                        )}

                        {showReturningBlock && (
                            <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4">
                                <p className="text-sm font-medium text-blue-900">
                                    Welcome back! We found an account for {customer?.email}. Choose how you want to continue.
                                </p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setReturningChoice('login')}
                                        className={`rounded-lg border px-3 py-2 text-sm font-semibold ${
                                            returningChoice === 'login'
                                                ? 'border-(--sf-accent) bg-(--sf-accent) text-(--sf-accent-text)'
                                                : 'border-(--sf-border) bg-(--sf-panel) text-(--sf-text) hover:border-(--sf-accent)'
                                        }`}
                                    >
                                        Sign in
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setReturningChoice('guest')}
                                        className={`rounded-lg border px-3 py-2 text-sm font-semibold ${
                                            returningChoice === 'guest'
                                                ? 'border-(--sf-accent) bg-(--sf-accent) text-(--sf-accent-text)'
                                                : 'border-(--sf-border) bg-(--sf-panel) text-(--sf-text) hover:border-(--sf-accent)'
                                        }`}
                                    >
                                        Continue as guest
                                    </button>
                                </div>

                                {returningChoice === 'login' && loginSlot && (
                                    <div className="mt-3">
                                        {loginSlot}
                                    </div>
                                )}

                                {returningChoice === 'guest' && (
                                    <p className="mt-2 text-xs text-blue-800">
                                        You can proceed without signing in. Saved addresses are not auto-filled as guest.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default ContactInfoSection;
