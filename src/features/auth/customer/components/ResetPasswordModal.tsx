import React, {useMemo, useState} from 'react';
import {
    completeCustomerPasswordReset,
    requestCustomerPasswordResetCode,
    verifyCustomerPasswordResetCode,
} from '@/services/CustomerService.ts';

interface ResetPasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialEmail?: string;
    onBackToLogin?: () => void;
}

export default function ResetPasswordModal({
                                               isOpen,
                                               onClose,
                                               initialEmail = '',
                                               onBackToLogin,
                                           }: ResetPasswordModalProps): React.ReactElement | null {
    const [email, setEmail] = useState<string>(initialEmail);
    const [code, setCode] = useState<string>('');
    const [newPassword, setNewPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');

    const [codeSent, setCodeSent] = useState<boolean>(false);
    const [codeVerified, setCodeVerified] = useState<boolean>(false);

    const [loadingRequest, setLoadingRequest] = useState<boolean>(false);
    const [loadingVerify, setLoadingVerify] = useState<boolean>(false);
    const [loadingReset, setLoadingReset] = useState<boolean>(false);

    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');

    const validEmail = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()), [email]);

    const handleRequestCode = async () => {
        if (!validEmail) {
            setError('Please enter a valid email address.');
            return;
        }

        setLoadingRequest(true);
        setError('');
        setSuccess('');

        try {
            await requestCustomerPasswordResetCode(email.trim());
            setCodeSent(true);
            setCodeVerified(false);
            setSuccess('If the account exists, a 6-digit reset code has been sent.');
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Could not request reset code.';
            setError(message);
        } finally {
            setLoadingRequest(false);
        }
    };

    const handleVerifyCode = async () => {
        if (!validEmail || !code.trim()) {
            setError('Email and 6-digit code are required.');
            return;
        }

        setLoadingVerify(true);
        setError('');
        setSuccess('');

        try {
            await verifyCustomerPasswordResetCode(email.trim(), code.trim());
            setCodeVerified(true);
            setSuccess('Code verified. You can now set a new password.');
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Could not verify code.';
            setError(message);
        } finally {
            setLoadingVerify(false);
        }
    };

    const handleResetPassword = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!codeVerified) {
            setError('Please verify your reset code first.');
            return;
        }

        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoadingReset(true);
        setError('');
        setSuccess('');

        try {
            await completeCustomerPasswordReset(email.trim(), code.trim(), newPassword, confirmPassword);
            setSuccess('Password reset successful.');
            setTimeout(() => {
                if (onBackToLogin) {
                    onBackToLogin();
                } else {
                    onClose();
                }
            }, 1000);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Could not reset password.';
            setError(message);
        } finally {
            setLoadingReset(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="mx-auto w-full max-w-xl">
                <div className="rounded-xl border border-(--sf-border) bg-(--sf-panel) p-6 sm:p-8 shadow-sm">
                    <div className="flex items-start justify-between mb-1">
                        <div>
                            <h1 className="text-2xl font-bold text-(--sf-text)">Reset Password</h1>
                            <p className="mt-2 text-sm text-(--sf-muted-text)">
                                Enter your email, verify your 6-digit code, then choose a new password.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Close"
                            className="ml-4 mt-1 text-(--sf-muted-text) hover:text-(--sf-text) transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                                 stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </button>
                    </div>

                    <form onSubmit={handleResetPassword} className="mt-6 space-y-4">
                        <div>
                            <label htmlFor="reset-email" className="mb-1 block text-sm font-medium text-(--sf-text)">
                                Email
                            </label>
                            <input
                                id="reset-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full rounded-lg border border-(--sf-border) bg-(--sf-bg) px-3 py-2 text-(--sf-text) outline-none focus:border-(--sf-accent) focus:ring-1 focus:ring-(--sf-accent)"
                                required
                            />
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={handleRequestCode}
                                disabled={loadingRequest || !validEmail}
                                className="rounded-lg bg-(--sf-accent) px-4 py-2 font-semibold text-(--sf-accent-text) hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loadingRequest ? 'Sending...' : codeSent ? 'Resend Code' : 'Send Code'}
                            </button>
                        </div>

                        {codeSent && (
                            <>
                                <div>
                                    <label htmlFor="reset-code"
                                           className="mb-1 block text-sm font-medium text-(--sf-text)">
                                        6-digit Code
                                    </label>
                                    <input
                                        id="reset-code"
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={6}
                                        value={code}
                                        onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        className="w-full rounded-lg border border-(--sf-border) bg-(--sf-bg) px-3 py-2 text-(--sf-text) outline-none focus:border-(--sf-accent) focus:ring-1 focus:ring-(--sf-accent)"
                                        required
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={handleVerifyCode}
                                    disabled={loadingVerify || code.trim().length !== 6}
                                    className="rounded-lg border border-(--sf-border) px-4 py-2 font-semibold text-(--sf-text) hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {loadingVerify ? 'Verifying...' : codeVerified ? 'Code Verified' : 'Verify Code'}
                                </button>
                            </>
                        )}

                        {codeVerified && (
                            <>
                                <div>
                                    <label htmlFor="reset-new-password"
                                           className="mb-1 block text-sm font-medium text-(--sf-text)">
                                        New Password
                                    </label>
                                    <input
                                        id="reset-new-password"
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        minLength={8}
                                        className="w-full rounded-lg border border-(--sf-border) bg-(--sf-bg) px-3 py-2 text-(--sf-text) outline-none focus:border-(--sf-accent) focus:ring-1 focus:ring-(--sf-accent)"
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="reset-confirm-password"
                                           className="mb-1 block text-sm font-medium text-(--sf-text)">
                                        Confirm Password
                                    </label>
                                    <input
                                        id="reset-confirm-password"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        minLength={8}
                                        className="w-full rounded-lg border border-(--sf-border) bg-(--sf-bg) px-3 py-2 text-(--sf-text) outline-none focus:border-(--sf-accent) focus:ring-1 focus:ring-(--sf-accent)"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loadingReset}
                                    className="rounded-lg bg-(--sf-accent) px-5 py-2.5 font-semibold text-(--sf-accent-text) hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {loadingReset ? 'Resetting...' : 'Reset Password'}
                                </button>
                            </>
                        )}

                        {error && (
                            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div
                                className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                                {success}
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={onBackToLogin ?? onClose}
                            className="inline-block rounded-lg border border-(--sf-border) px-4 py-2 text-sm font-semibold text-(--sf-text) hover:bg-black/5"
                        >
                            Back to Login
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

