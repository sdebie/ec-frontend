import React from 'react';
import { CustomerProfile } from '../../../services/CustomerService';

export type LookupState = 'idle' | 'loading' | 'found' | 'not_found' | 'error';

interface Props {
  email: string;
  setEmail: (v: string) => void;
  emailValid: boolean;
  emailTouched: boolean;
  setEmailTouched: (v: boolean) => void;
  lookupState: LookupState;
  customer: CustomerProfile | null;
}

const ContactInfoSection: React.FC<Props> = ({
  email,
  setEmail,
  emailValid,
  emailTouched,
  setEmailTouched,
  lookupState,
  customer,
}) => {
  return (
    <section className="bg-white p-6 rounded-2xl shadow-sm border">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <span className="bg-blue-600 text-white w-6 h-6 rounded-full text-xs flex items-center justify-center">1</span>
        Contact Information
      </h3>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onBlur={() => setEmailTouched(true)}
        placeholder="your@email.com"
        className="w-full p-3 border rounded-xl"
      />
      {email && (
        <div className="mt-2 text-xs">
          {(!emailValid && emailTouched) && (
            <span className="text-red-600">Please enter a valid email address.</span>
          )}
          {emailValid && (
            <div>
              {lookupState === 'loading' && (
                <span className="text-gray-500">Checking account…</span>
              )}
              {lookupState === 'found' && customer && customer.shopperType?.toUpperCase() === 'RETURNING' && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                  Account found for {customer.email}
                </span>
              )}
              {lookupState === 'found' && customer && customer.shopperType?.toUpperCase() === 'GUEST' && (
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
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default ContactInfoSection;
