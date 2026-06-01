import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

import { loginCustomer, loginCustomerWithGoogle, CustomerProfile } from '@/services/CustomerService.ts';
import { customerTypeStore } from '@/store/customerTypeStore.ts';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (profile: CustomerProfile) => void;
  onRequestPasswordReset: (email?: string) => void;
  email?: string;
  showEmailField?: boolean;
  title?: string;
}

// IMPORTANT: Replace with your actual Google Client ID
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID';

const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  onRequestPasswordReset,
  email = '',
  showEmailField = false,
  title = 'Sign In to Your Account',
}) => {
  const [emailInput, setEmailInput] = useState<string>(email);
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const normalizedEmail = emailInput.trim();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const profile = await loginCustomer(emailInput.trim(), password);
      customerTypeStore.getState().syncFromProfile(profile);
      setPassword('');
      onLoginSuccess(profile);
      onClose();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Login failed. Please check your credentials.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLoginSuccess = async (credentialResponse: any) => {
    setError(null);
    setLoading(true);
    try {
      if (!credentialResponse.credential) {
        throw new Error('No credential found in Google response.');
      }
      const profile = await loginCustomerWithGoogle(credentialResponse.credential);
      customerTypeStore.getState().syncFromProfile(profile);
      onLoginSuccess(profile);
      onClose();
    } catch (err: any) {
      const errorMsg = typeof err?.message === 'string' ? err.message : 'Google login failed. Please try again.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLoginError = () => {
    console.error('Google Login Failed');
    setError('Google login failed. Please try again.');
  };

  if (!isOpen) return null;

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
        <div className="mx-auto w-full max-w-xl">
          <div className="rounded-xl border border-(--sf-border) bg-(--sf-panel) p-6 sm:p-8 shadow-sm">

            {/* Header */}
            <div className="flex items-start justify-between mb-1">
              <div>
                <h1 className="text-2xl font-bold text-(--sf-text)">{title}</h1>
                <p className="mt-2 text-sm text-(--sf-muted-text)">
                  Enter your credentials to sign in to your account.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="ml-4 mt-1 text-(--sf-muted-text) hover:text-(--sf-text) transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">

              {/* Email Field */}
              {showEmailField && (
                <div>
                  <label htmlFor="lm-email" className="mb-1 block text-sm font-medium text-(--sf-text)">
                    Email Address
                  </label>
                  <input
                    id="lm-email"
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full rounded-lg border border-(--sf-border) bg-(--sf-bg) px-3 py-2 text-(--sf-text) outline-none focus:border-(--sf-accent) focus:ring-1 focus:ring-(--sf-accent)"
                    required={showEmailField}
                  />
                </div>
              )}

              {/* Password Field */}
              <div>
                <label htmlFor="lm-password" className="mb-1 block text-sm font-medium text-(--sf-text)">
                  Password
                </label>
                <input
                  id="lm-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-lg border border-(--sf-border) bg-(--sf-bg) px-3 py-2 text-(--sf-text) outline-none focus:border-(--sf-accent) focus:ring-1 focus:ring-(--sf-accent)"
                  required
                />
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Sign In */}
              <button
                type="submit"
                disabled={loading || (!showEmailField && !emailInput) || !password}
                className="w-full rounded-lg bg-(--sf-accent) px-5 py-2.5 font-semibold text-(--sf-accent-text) hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>

              {/* Google Login Button */}
              <div className="w-full flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleLoginSuccess}
                  onError={handleGoogleLoginError}
                  disabled={loading}
                  // You can customize the button appearance using the `render` prop
                  // For example:
                  render={({ onClick, disabled }) => (
                    <button
                      onClick={onClick}
                      disabled={disabled || loading}
                      className="flex w-full items-center justify-center space-x-2 rounded-lg border border-(--sf-border) px-5 py-2.5 font-semibold text-(--sf-text) hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <img src="https://www.svgrepo.com/show/355037/google.svg" alt="Google logo" className="h-5 w-5" />
                      <span>{loading ? 'Signing in with Google...' : 'Login with Google'}</span>
                    </button>
                  )}
                />
              </div>


              {/* Create Account */}
              <Link
                to="/create-account"
                onClick={onClose}
                className="block w-full rounded-lg border border-(--sf-border) px-5 py-2.5 text-center font-semibold text-(--sf-text) hover:bg-black/5"
              >
                Create Account
              </Link>

              {/* Reset Password */}
              <button
                  type="button"
                  onClick={() => onRequestPasswordReset(normalizedEmail || undefined)}
                  className="block w-full text-center text-sm font-medium text-(--sf-accent) hover:underline"
              >
                Reset Password
              </button>

            </form>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default LoginModal;