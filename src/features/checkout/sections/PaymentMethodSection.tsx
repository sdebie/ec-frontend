import { CreditCard } from 'lucide-react';
import React from 'react';

import { PaymentMethodInfo, PaymentMethodKey, PaymentMethodsConfig } from '@/services/StoreSettings.ts';

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
        <div className="mt-10 border-t border-(--sf-border) pt-10">
            <h2 className="mb-3 text-lg font-medium text-(--sf-text)">Payment</h2>
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
                                        ? 'border-(--sf-accent) bg-(--sf-bg)'
                                        : 'border-(--sf-border) hover:border-(--sf-accent)'
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="payment"
                                    className="sr-only"
                                    checked={selectedPayment === pm}
                                    onChange={() => setSelectedPayment(pm)}
                                />
                                <CreditCard className="h-5 w-5 text-(--sf-muted-text)" />
                                <div>
                                    <p className="text-sm font-semibold text-(--sf-text)">{title}</p>
                                    <p className="text-xs text-(--sf-muted-text)">{description}</p>
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
