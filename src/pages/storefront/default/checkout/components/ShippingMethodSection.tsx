import React, {useEffect} from 'react';
import {ShippingMethod} from '@/services/StoreSettings.ts';
import {CustomerProfile} from '@/services/CustomerService.ts';
import {formatCurrency} from './helpers.ts';

type Address = {
    street: string;
    city: string;
    postalCode: string;
    province: string;
};

type Props = {
    shippingMethods: ShippingMethod[];
    selectedMethodId: string | null;
    setSelectedMethodId: (id: string) => void;
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
    isAccountAddressEdited: boolean;
    updateAccountAddress: boolean;
    setUpdateAccountAddress: (v: boolean) => void;
};

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
    useEffect(() => {
        if ((selectedMethodId === null || selectedMethodId === undefined) && shippingMethods.length > 0) {
            const firstWithId = shippingMethods.find((m) => typeof m.id === 'string');
            if (firstWithId?.id) {
                setSelectedMethodId(firstWithId.id);
            }
        }
    }, [selectedMethodId, shippingMethods, setSelectedMethodId]);

    return (
        <div className="mt-8 border-t border-(--sf-border) pt-8">
            <h2 className="text-lg font-medium text-(--sf-text)">Shipping information</h2>
            <div className="mt-5 space-y-3">
                {shippingMethods.map((method) => (
                    <label
                        key={method.id}
                        className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition ${
                            selectedMethodId === method.id
                                ? 'border-(--sf-accent) bg-(--sf-bg)'
                                : 'border-(--sf-border) hover:border-(--sf-accent)'
                        }`}
                    >
                        <input
                            type="radio"
                            name="shipping"
                            className="sr-only"
                            checked={selectedMethodId === method.id}
                            onChange={() => method.id && setSelectedMethodId(method.id)}
                        />
                        <div>
                            <p className="text-sm font-semibold text-(--sf-text)">{method.name || 'Shipping'}</p>
                            <p className="text-xs text-(--sf-muted-text)">{method.estimatedDays || 'Standard'} delivery</p>
                        </div>
                        <p className="text-sm font-semibold text-(--sf-text)">{formatCurrency(Number(method.baseFee || 0))}</p>
                    </label>
                ))}
            </div>

            {needsShippingAddress && (
                <div className="mt-5 space-y-3 border-t border-(--sf-border) pt-5">
                    <p className="text-sm font-medium text-(--sf-text)">Delivery address</p>
                    <input
                        placeholder="Street address"
                        value={address.street}
                        className="w-full rounded-lg border border-(--sf-border) px-3 py-2 text-sm text-(--sf-text) outline-none focus:border-(--sf-accent) focus:ring-1 focus:ring-(--sf-accent)"
                        onChange={(e) => setAddress({...address, street: e.target.value})}
                    />
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <input
                            placeholder="City"
                            value={address.city}
                            className="rounded-lg border border-(--sf-border) px-3 py-2 text-sm text-(--sf-text) outline-none focus:border-(--sf-accent) focus:ring-1 focus:ring-(--sf-accent)"
                            onChange={(e) => setAddress({...address, city: e.target.value})}
                        />
                        <input
                            placeholder="Postal code"
                            value={address.postalCode}
                            className="rounded-lg border border-(--sf-border) px-3 py-2 text-sm text-(--sf-text) outline-none focus:border-(--sf-accent) focus:ring-1 focus:ring-(--sf-accent)"
                            onChange={(e) => setAddress({...address, postalCode: e.target.value})}
                        />
                    </div>
                    <input
                        placeholder="Province"
                        value={address.province}
                        className="w-full rounded-lg border border-(--sf-border) px-3 py-2 text-sm text-(--sf-text) outline-none focus:border-(--sf-accent) focus:ring-1 focus:ring-(--sf-accent)"
                        onChange={(e) => setAddress({...address, province: e.target.value})}
                    />

                    {customer && isAuthenticated && isAccountAddressEdited && (
                        <div className="rounded-lg border border-(--sf-border) bg-(--sf-bg) p-3">
                            <label className="flex items-center gap-2 text-sm text-(--sf-text)">
                                <input
                                    type="checkbox"
                                    checked={updateAccountAddress}
                                    onChange={(e) => setUpdateAccountAddress(e.target.checked)}
                                />
                                Update my account with these address changes
                            </label>
                        </div>
                    )}

                    {(!customer || !customer.hasPassword) && (
                        <div className="rounded-lg border border-(--sf-border) bg-(--sf-bg) p-3">
                            <label className="flex items-center gap-2 text-sm text-(--sf-text)">
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
                                <div className="mt-3 space-y-2">
                                    <input
                                        type="password"
                                        placeholder="Create a password (min 6 characters)"
                                        value={registerPassword}
                                        onChange={(e) => setRegisterPassword(e.target.value)}
                                        className="w-full rounded-lg border border-(--sf-border) px-3 py-2 text-sm text-(--sf-text) outline-none focus:border-(--sf-accent) focus:ring-1 focus:ring-(--sf-accent)"
                                    />
                                    <input
                                        type="password"
                                        placeholder="Confirm your password"
                                        value={registerPasswordConfirm}
                                        onChange={(e) => setRegisterPasswordConfirm(e.target.value)}
                                        className="w-full rounded-lg border border-(--sf-border) px-3 py-2 text-sm text-(--sf-text) outline-none focus:border-(--sf-accent) focus:ring-1 focus:ring-(--sf-accent)"
                                    />
                                    {registerPassword &&
                                        registerPasswordConfirm &&
                                        registerPassword !== registerPasswordConfirm && (
                                            <p className="text-xs text-(--sf-error)">Passwords do not match.</p>
                                        )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ShippingMethodSection;

