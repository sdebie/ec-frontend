import React from 'react';
import { ShippingMethod } from '../../../services/StoreSettings';
import { CustomerProfile } from '../../../services/CustomerService';

interface Address {
  street: string;
  city: string;
  postalCode: string;
  province: string;
}

interface Props {
  shippingMethods: ShippingMethod[];
  selectedMethodId: number | null;
  setSelectedMethodId: (id: number) => void;
  needsShippingAddress: boolean;
  customer: CustomerProfile | null;
  isAuthenticated: boolean;
  address: Address;
  setAddress: (a: Address) => void;
  returningChoice: 'login' | 'guest' | null;
  setReturningChoice: (v: 'login' | 'guest' | null) => void;
  loginPassword: string;
  setLoginPassword: (v: string) => void;
  handleLogin: () => void;
  saveDetails: boolean;
  setSaveDetails: (v: boolean) => void;
  registerPassword: string;
  setRegisterPassword: (v: string) => void;
  registerPasswordConfirm: string;
  setRegisterPasswordConfirm: (v: string) => void;
}

const ShippingMethodSection: React.FC<Props> = ({
  shippingMethods,
  selectedMethodId,
  setSelectedMethodId,
  needsShippingAddress,
  customer,
  isAuthenticated,
  address,
  setAddress,
  returningChoice,
  setReturningChoice,
  loginPassword,
  setLoginPassword,
  handleLogin,
  saveDetails,
  setSaveDetails,
  registerPassword,
  setRegisterPassword,
  registerPasswordConfirm,
  setRegisterPasswordConfirm,
}) => {
  return (
    <section className="bg-white p-6 rounded-2xl shadow-sm border">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <span className="bg-blue-600 text-white w-6 h-6 rounded-full text-xs flex items-center justify-center">2</span>
        Shipping Method
      </h3>
      <div className="grid gap-3">
        {shippingMethods.map((method) => (
          <label
            key={method.id}
            className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
              selectedMethodId === method.id ? 'border-blue-600 bg-blue-50' : 'border-gray-100'
            }`}
          >
            <div className="flex justify-between items-center">
              <input
                type="radio"
                name="shipping"
                className="hidden"
                onChange={() => setSelectedMethodId(method.id!)}
              />
              <div>
                <p className="font-bold">{method.name}</p>
                <p className="text-sm text-gray-500">{method.estimatedDays} delivery</p>
              </div>
              <span className="font-bold">R{method.baseFee}</span>
            </div>
          </label>
        ))}
      </div>

      {needsShippingAddress && (
        <div className="mt-6 space-y-3 animate-in slide-in-from-top-4 duration-300">
          <p className="text-sm font-semibold text-gray-600">Delivery Address</p>
          {customer && isAuthenticated && (
            <div className="text-xs text-green-700 bg-green-50 border border-green-100 rounded-lg p-2">
              Address loaded from your account. You can edit below.
            </div>
          )}
          <input
            placeholder="Street Address"
            value={address.street}
            className="w-full p-3 border rounded-xl"
            onChange={(e) => setAddress({ ...address, street: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder="City"
              value={address.city}
              className="p-3 border rounded-xl"
              onChange={(e) => setAddress({ ...address, city: e.target.value })}
            />
            <input
              placeholder="Postal Code"
              value={address.postalCode}
              className="p-3 border rounded-xl"
              onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
            />
          </div>

          {customer && customer.shopperType.toUpperCase() !== 'GUEST' && !isAuthenticated && (
            <div className="mt-4 p-4 border rounded-xl bg-blue-50 border-blue-100">
              <p className="text-sm font-medium text-blue-900">
                Welcome back! We found an account for {customer.email}. Would you like to:
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

          {(!customer || !customer.hasPassword) && (
            <div className="mt-2 p-3 border rounded-xl bg-gray-50">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={saveDetails}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setSaveDetails(checked);
                    if (!checked) {
                      setRegisterPassword('');
                      setRegisterPasswordConfirm('');
                    }
                  }}
                />
                Save my details for next time (create an account)
              </label>
              {saveDetails && (
                <div className="mt-2 space-y-2">
                  <input
                    type="password"
                    placeholder="Create a password (min 6 characters)"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    className="w-full p-3 border rounded-xl"
                  />
                  <input
                    type="password"
                    placeholder="Confirm your password"
                    value={registerPasswordConfirm}
                    onChange={(e) => setRegisterPasswordConfirm(e.target.value)}
                    className="w-full p-3 border rounded-xl"
                  />
                  {registerPassword &&
                    registerPasswordConfirm &&
                    registerPassword !== registerPasswordConfirm && (
                      <p className="text-xs text-red-600">Passwords do not match.</p>
                    )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default ShippingMethodSection;
