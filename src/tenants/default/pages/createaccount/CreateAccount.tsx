import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { registerOrUpdateCustomer } from '@/services/CustomerService.ts';

type CreateAccountForm = {
    email: string;
    confirmEmail: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    phone: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    province: string;
    postalCode: string;
    shippingSameAsPostal: boolean;
};

const initialForm: CreateAccountForm = {
    email: '',
    confirmEmail: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    province: '',
    postalCode: '',
    shippingSameAsPostal: true,
};

function getPasswordStrength(password: string): {
    score: number;
    label: 'Weak' | 'Fair' | 'Good' | 'Strong';
    colorClass: string;
    valid: boolean;
} {
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 1) return { score, label: 'Weak', colorClass: 'bg-red-500', valid: false };
    if (score === 2) return { score, label: 'Fair', colorClass: 'bg-yellow-500', valid: false };
    if (score === 3) return { score, label: 'Good', colorClass: 'bg-blue-500', valid: true };
    return { score, label: 'Strong', colorClass: 'bg-green-600', valid: true };
}

const CreateAccount: React.FC = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState<CreateAccountForm>(initialForm);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const passwordStrength = getPasswordStrength(form.password);

    const updateField = <K extends keyof CreateAccountForm>(field: K, value: CreateAccountForm[K]) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);

        if (form.email.trim().toLowerCase() !== form.confirmEmail.trim().toLowerCase()) {
            setError('Email and email verification must match.');
            return;
        }

        if (!passwordStrength.valid) {
            setError('Password is too weak. Use at least 8 characters with mixed character types.');
            return;
        }

        if (form.password !== form.confirmPassword) {
            setError('Password and password confirmation must match.');
            return;
        }

        setIsSubmitting(true);

        try {
            await registerOrUpdateCustomer({
                email: form.email.trim(),
                password: form.password,
                firstName: form.firstName.trim(),
                lastName: form.lastName.trim(),
                phone: form.phone.trim(),
                physicalAddressLine1: form.addressLine1.trim(),
                physicalAddressLine2: form.addressLine2.trim(),
                physicalCity: form.city.trim(),
                physicalProvince: form.province.trim(),
                physicalPostalCode: form.postalCode.trim(),
                postalAddressLine1: form.addressLine1.trim(),
                postalAddressLine2: form.addressLine2.trim(),
                postalCity: form.city.trim(),
                postalProvince: form.province.trim(),
                postalPostalCode: form.postalCode.trim(),
            });

            setSuccess(true);
            setTimeout(() => navigate('/checkout'), 1200);
        } catch (err: any) {
            const message = typeof err?.message === 'string' ? err.message : 'Could not create account. Please try again.';
            setError(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="rounded-xl border border-(--sf-border) bg-(--sf-panel) p-6 sm:p-8 shadow-sm">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-(--sf-text)">Create Customer Account</h1>
                    <p className="mt-2 text-sm text-(--sf-muted-text)">
                        Complete your details to create a customer profile for faster checkout.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-1">
                            <label htmlFor="email" className="mb-1 block text-sm font-medium text-(--sf-text)">Email</label>
                            <input
                                id="email"
                                type="email"
                                value={form.email}
                                onChange={(e) => updateField('email', e.target.value)}
                                className="w-full rounded-lg border border-(--sf-border) bg-(--sf-bg) px-3 py-2 text-(--sf-text) outline-none focus:border-(--sf-accent) focus:ring-1 focus:ring-(--sf-accent)"
                                required
                            />
                        </div>

                        <div className="sm:col-span-1">
                            <label htmlFor="confirmEmail" className="mb-1 block text-sm font-medium text-(--sf-text)">Verify Email</label>
                            <input
                                id="confirmEmail"
                                type="email"
                                value={form.confirmEmail}
                                onChange={(e) => updateField('confirmEmail', e.target.value)}
                                className="w-full rounded-lg border border-(--sf-border) bg-(--sf-bg) px-3 py-2 text-(--sf-text) outline-none focus:border-(--sf-accent) focus:ring-1 focus:ring-(--sf-accent)"
                                required
                            />
                        </div>

                        <div className="sm:col-span-1">
                            <label htmlFor="firstName" className="mb-1 block text-sm font-medium text-(--sf-text)">First Name</label>
                            <input
                                id="firstName"
                                value={form.firstName}
                                onChange={(e) => updateField('firstName', e.target.value)}
                                className="w-full rounded-lg border border-(--sf-border) bg-(--sf-bg) px-3 py-2 text-(--sf-text) outline-none focus:border-(--sf-accent) focus:ring-1 focus:ring-(--sf-accent)"
                                required
                            />
                        </div>

                        <div className="sm:col-span-1">
                            <label htmlFor="password" className="mb-1 block text-sm font-medium text-(--sf-text)">Password</label>
                            <input
                                id="password"
                                type="password"
                                value={form.password}
                                onChange={(e) => updateField('password', e.target.value)}
                                className="w-full rounded-lg border border-(--sf-border) bg-(--sf-bg) px-3 py-2 text-(--sf-text) outline-none focus:border-(--sf-accent) focus:ring-1 focus:ring-(--sf-accent)"
                                minLength={8}
                                required
                            />
                            {form.password && (
                                <div className="mt-2 space-y-1">
                                    <div className="h-1.5 w-full rounded bg-gray-200">
                                        <div
                                            className={`h-1.5 rounded transition-all ${passwordStrength.colorClass}`}
                                            style={{ width: `${Math.max(20, passwordStrength.score * 20)}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-(--sf-muted-text)">
                                        Strength: <span className="font-semibold text-(--sf-text)">{passwordStrength.label}</span>
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="sm:col-span-1">
                            <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-(--sf-text)">Confirm Password</label>
                            <input
                                id="confirmPassword"
                                type="password"
                                value={form.confirmPassword}
                                onChange={(e) => updateField('confirmPassword', e.target.value)}
                                className="w-full rounded-lg border border-(--sf-border) bg-(--sf-bg) px-3 py-2 text-(--sf-text) outline-none focus:border-(--sf-accent) focus:ring-1 focus:ring-(--sf-accent)"
                                minLength={8}
                                required
                            />
                        </div>

                        <div className="sm:col-span-1">
                            <label htmlFor="lastName" className="mb-1 block text-sm font-medium text-(--sf-text)">Last Name</label>
                            <input
                                id="lastName"
                                value={form.lastName}
                                onChange={(e) => updateField('lastName', e.target.value)}
                                className="w-full rounded-lg border border-(--sf-border) bg-(--sf-bg) px-3 py-2 text-(--sf-text) outline-none focus:border-(--sf-accent) focus:ring-1 focus:ring-(--sf-accent)"
                                required
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label htmlFor="phone" className="mb-1 block text-sm font-medium text-(--sf-text)">Phone</label>
                            <input
                                id="phone"
                                value={form.phone}
                                onChange={(e) => updateField('phone', e.target.value)}
                                className="w-full rounded-lg border border-(--sf-border) bg-(--sf-bg) px-3 py-2 text-(--sf-text) outline-none focus:border-(--sf-accent) focus:ring-1 focus:ring-(--sf-accent)"
                                required
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label htmlFor="addressLine1" className="mb-1 block text-sm font-medium text-(--sf-text)">Address Line 1</label>
                            <input
                                id="addressLine1"
                                value={form.addressLine1}
                                onChange={(e) => updateField('addressLine1', e.target.value)}
                                className="w-full rounded-lg border border-(--sf-border) bg-(--sf-bg) px-3 py-2 text-(--sf-text) outline-none focus:border-(--sf-accent) focus:ring-1 focus:ring-(--sf-accent)"
                                required
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label htmlFor="addressLine2" className="mb-1 block text-sm font-medium text-(--sf-text)">Address Line 2</label>
                            <input
                                id="addressLine2"
                                value={form.addressLine2}
                                onChange={(e) => updateField('addressLine2', e.target.value)}
                                className="w-full rounded-lg border border-(--sf-border) bg-(--sf-bg) px-3 py-2 text-(--sf-text) outline-none focus:border-(--sf-accent) focus:ring-1 focus:ring-(--sf-accent)"
                            />
                        </div>

                        <div>
                            <label htmlFor="city" className="mb-1 block text-sm font-medium text-(--sf-text)">City</label>
                            <input
                                id="city"
                                value={form.city}
                                onChange={(e) => updateField('city', e.target.value)}
                                className="w-full rounded-lg border border-(--sf-border) bg-(--sf-bg) px-3 py-2 text-(--sf-text) outline-none focus:border-(--sf-accent) focus:ring-1 focus:ring-(--sf-accent)"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="province" className="mb-1 block text-sm font-medium text-(--sf-text)">Province</label>
                            <input
                                id="province"
                                value={form.province}
                                onChange={(e) => updateField('province', e.target.value)}
                                className="w-full rounded-lg border border-(--sf-border) bg-(--sf-bg) px-3 py-2 text-(--sf-text) outline-none focus:border-(--sf-accent) focus:ring-1 focus:ring-(--sf-accent)"
                                required
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label htmlFor="postalCode" className="mb-1 block text-sm font-medium text-(--sf-text)">Postal Code</label>
                            <input
                                id="postalCode"
                                value={form.postalCode}
                                onChange={(e) => updateField('postalCode', e.target.value)}
                                className="w-full rounded-lg border border-(--sf-border) bg-(--sf-bg) px-3 py-2 text-(--sf-text) outline-none focus:border-(--sf-accent) focus:ring-1 focus:ring-(--sf-accent)"
                                required
                            />
                        </div>

                        <label className="sm:col-span-2 inline-flex items-center gap-2 text-sm text-(--sf-text)">
                            <input
                                type="checkbox"
                                checked={form.shippingSameAsPostal}
                                onChange={(e) => updateField('shippingSameAsPostal', e.target.checked)}
                                className="h-4 w-4 rounded border-(--sf-border)"
                            />
                            Shipping address is the same as postal address
                        </label>
                    </div>

                    {error && (
                        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                            Account created. Redirecting you to checkout.
                        </div>
                    )}

                    <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="rounded-lg bg-(--sf-accent) px-5 py-2.5 font-semibold text-(--sf-accent-text) hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isSubmitting ? 'Creating account...' : 'Create Account'}
                        </button>

                        <Link
                            to="/"
                            className="rounded-lg border border-(--sf-border) px-5 py-2.5 text-center font-semibold text-(--sf-text) hover:bg-black/5"
                        >
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateAccount;

