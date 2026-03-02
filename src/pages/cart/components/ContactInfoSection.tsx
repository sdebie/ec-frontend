import React from 'react';
import { CustomerProfile } from '../../../services/CustomerService';
import {CustomerType} from "../../../utils/enums/CustomerType";

export type LookupState = 'idle' | 'loading' | 'found' | 'not_found' | 'error';

interface Props {
  email: string;
  setEmail: (v: string) => void;
  emailValid: boolean;
  emailTouched: boolean;
  setEmailTouched: (v: boolean) => void;
  lookupState: LookupState;
  customer: CustomerProfile | null;
  // New props to move returning-customer actions into this section
  isAuthenticated: boolean;
  needsShippingAddress: boolean;
  returningChoice: 'login' | 'guest' | null;
  setReturningChoice: (v: 'login' | 'guest' | null) => void;
  loginPassword: string;
  setLoginPassword: (v: string) => void;
  handleLogin: () => void;
}

const ContactInfoSection: React.FC<Props> = ({
  email,
  setEmail,
  emailValid,
  emailTouched,
  setEmailTouched,
  lookupState,
  customer,
  isAuthenticated,
  needsShippingAddress,
  returningChoice,
  setReturningChoice,
  loginPassword,
  setLoginPassword,
  handleLogin,
}) => {
  const showReturningBlock =
    !!customer && !!customer.hasPassword && customer.shopperType?.toUpperCase() !== 'GUEST' &&
    !isAuthenticated && emailValid && lookupState === 'found';

  console.log("DEBUG:: Valid Email:"+emailValid);
  return (
    <section className="bg-white p-6 rounded-2xl shadow-sm border">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <span className="bg-blue-600 text-white w-6 h-6 rounded-full text-xs flex items-center justify-center">1</span>
        Contact Information: {emailValid}
      </h3>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onBlur={() => setEmailTouched(true)}
        placeholder="your@email.com"
        className={`w-full p-3 border rounded-xl ${isAuthenticated ? 'bg-gray-100 text-gray-600 cursor-not-allowed' : ''}`}
        disabled={isAuthenticated}
      />
      {email && (
        <div className="mt-2 text-xs">
          {(!emailValid && emailTouched) && (
            <span className="text-red-600">Please enter a valid email address.</span>
          )}
          {emailValid && (
            <div>
              {isAuthenticated ? (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-green-50 text-green-700 border border-green-100">
                  Welcome back{customer?.firstName ? `, ${customer.firstName}` : ''}! ({email})
                </span>
              ) : (
                <>
                  {lookupState === 'loading' && (
                    <span className="text-gray-500">Checking account…</span>
                  )}
                  {lookupState === 'found' && customer && customer.shopperType?.toUpperCase() === CustomerType.REGISTERED.toUpperCase() && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                      Account found for {customer.email}
                    </span>
                  )}
                  {lookupState === 'found' && customer && customer.shopperType?.toUpperCase() === CustomerType.GUEST.toUpperCase() && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                      Continuing as guest
                    </span>
                  )}
                  {lookupState === 'not_found' && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-green-50 text-green-700 border border-green-100">
                      No account found — continuing as guest
                    </span>
                  )}
                  {lookupState === 'error' && (
                    <span className="text-yellow-700 bg-yellow-50 border border-yellow-200 px-2 py-1 rounded-md">Could not check account right now.</span>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}

      {showReturningBlock && (
        <div className="mt-4 p-4 border rounded-xl bg-blue-50 border-blue-100">
          <p className="text-sm font-medium text-blue-900">
            Welcome back! We found an account for {customer?.email}. Would you like to:
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setReturningChoice('login')}
              className={`px-3 py-2 rounded-lg text-sm font-semibold border ${
                returningChoice === 'login'
                  ? 'bg-blue-600 text-white border-blue-700'
                  : 'bg-white text-blue-700 border-blue-300'
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => {
                setReturningChoice('guest');
                setLoginPassword('');
              }}
              className={`px-3 py-2 rounded-lg text-sm font-semibold border ${
                returningChoice === 'guest'
                  ? 'bg-blue-600 text-white border-blue-700'
                  : 'bg-white text-blue-700 border-blue-300'
              }`}
            >
              Continue as guest
            </button>
          </div>

          {returningChoice === 'login' && (
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2">
              <input
                type="password"
                placeholder="Enter your password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="p-3 border rounded-xl"
              />
              <button onClick={handleLogin} className="px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold">
                Sign in
              </button>
            </div>
          )}

          {returningChoice === 'guest' && (
            <p className="text-xs text-blue-800 mt-2">
              You can proceed without signing in. Your saved address won’t be auto-filled.
            </p>
          )}

          {!returningChoice && (
            <p className="text-xs text-blue-800 mt-2">Choose an option above to continue.</p>
          )}
        </div>
      )}
    </section>
  );
};

export default ContactInfoSection;
