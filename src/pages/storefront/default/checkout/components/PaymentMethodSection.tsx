import React from 'react';
import {CreditCard} from 'lucide-react';
import {PaymentMethodInfo, PaymentMethodKey, PaymentMethodsConfig} from '@/services/StoreSettings.ts';

type Props = {
    enabledPayments: PaymentMethodKey[];
    paymentConfig: PaymentMethodsConfig;
    selectedPayment: PaymentMethodKey | null;
    setSelectedPayment: (pm: PaymentMethodKey) => void;
};

const PaymentMethodSection: React.FC<Props> = ({
                                                   enabledPayments,
                                                   paymentConfig,
                                                   selectedPayment,
                                                   setSelectedPayment,
                                               }) => {
    return (
        <div className="mt-10 border-t border-gray-200 pt-10">
            <h2 className="text-lg font-medium text-gray-900 mb-3">Payment</h2>
            {enabledPayments.length === 0 ? (
                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
                    No payment methods are currently available. Please contact the store.
                </div>
            ) : (
                <div className="space-y-3">
                    {enabledPayments.map((pm) => {
                        const info = paymentConfig[pm as PaymentMethodKey] as PaymentMethodInfo | undefined;
                        const title = info?.displayName || (pm === 'IN_STORE' ? 'Pay in store' : 'FastPay');
                        const description =
                            info?.description ||
                            (pm === 'IN_STORE' ? 'Cash/Card at Pickup' : 'Card / Instant EFT / Scan to Pay');

                        return (
                            <label
                                key={pm}
                                className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${
                                    selectedPayment === pm
                                        ? 'border-gray-900 bg-gray-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="payment"
                                    className="sr-only"
                                    checked={selectedPayment === pm}
                                    onChange={() => setSelectedPayment(pm)}
                                />
                                <CreditCard className="h-5 w-5 text-gray-700"/>
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">{title}</p>
                                    <p className="text-xs text-gray-500">{description}</p>
                                </div>
                            </label>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default PaymentMethodSection;

