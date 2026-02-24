import React, { useEffect } from 'react';
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
  saveDetails: boolean;
  setSaveDetails: (v: boolean) => void;
  registerPassword: string;
  setRegisterPassword: (v: string) => void;
  registerPasswordConfirm: string;
  setRegisterPasswordConfirm: (v: string) => void;
  // New: show and control account address update when edited
  isAccountAddressEdited?: boolean;
  updateAccountAddress?: boolean;
  setUpdateAccountAddress?: (v: boolean) => void;
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
  saveDetails,
  setSaveDetails,
  registerPassword,
  setRegisterPassword,
  registerPasswordConfirm,
  setRegisterPasswordConfirm,
  isAccountAddressEdited,
  updateAccountAddress,
  setUpdateAccountAddress,
}) => {
  // Select the first available shipping method by default when none is selected
  useEffect(() => {
    if ((selectedMethodId === null || selectedMethodId === undefined) && shippingMethods && shippingMethods.length > 0) {
      const firstWithId = shippingMethods.find(m => m.id !== null && m.id !== undefined);
      if (firstWithId && typeof firstWithId.id === 'number') {
        setSelectedMethodId(firstWithId.id);
      }
    }
  }, [selectedMethodId, shippingMethods, setSelectedMethodId]);

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
                checked={selectedMethodId === method.id}
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
          {/*{customer && isAuthenticated && (*/}
          {/*  <div className="text-xs text-green-700 bg-green-50 border border-green-100 rounded-lg p-2">*/}
          {/*    Address loaded from your account. You can edit below.*/}
          {/*  </div>*/}
          {/*)}*/}
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
          {customer && isAuthenticated && isAccountAddressEdited && (
              <div className="mt-2 p-3 border rounded-xl bg-gray-50">
                <label className="flex items-center gap-2 text-sm">
                  <input
                      type="checkbox"
                      checked={!!updateAccountAddress}
                      onChange={(e) => setUpdateAccountAddress && setUpdateAccountAddress(e.target.checked)}
                  />
                  Update my account with these address changes
                </label>
                <p className="text-xs text-gray-600 mt-1">If checked, your saved address will be updated in your profile.</p>
              </div>
          )}

          {/* Returning customer sign-in/guest choice moved to Contact Information section */}

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
