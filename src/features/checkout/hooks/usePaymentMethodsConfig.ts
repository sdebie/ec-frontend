import {type Dispatch, type SetStateAction, useEffect, useMemo, useState} from 'react';

import {useQuery} from '@tanstack/react-query';

import {
    fetchPaymentMethodsConfig,
    type PaymentMethodInfo,
    type PaymentMethodKey,
    type PaymentMethodsConfig,
} from '@/services/StoreSettings.ts';

/**
 * Loads enabled payment methods from Store Settings.
 * Payment config changes rarely — treated as session-stable (staleTime 10 min).
 */
export function usePaymentMethodsConfig(): {
    paymentConfig: PaymentMethodsConfig;
    enabledPayments: PaymentMethodKey[];
    selectedPayment: PaymentMethodKey | null;
    setSelectedPayment: Dispatch<SetStateAction<PaymentMethodKey | null>>;
} {
    const [selectedPayment, setSelectedPayment] = useState<PaymentMethodKey | null>(null);

    const query = useQuery({
        queryKey: ['paymentMethodsConfig'],
        queryFn: () =>
            fetchPaymentMethodsConfig().catch((e) => {
                console.warn('Failed to load payment methods', e);
                return {} as PaymentMethodsConfig;
            }),
        staleTime: 1000 * 60 * 10,
    });

    const paymentConfig = query.data ?? {};

    const enabledPayments = useMemo(
        () =>
            Object.entries(paymentConfig)
                .filter(([, info]) => !!info && (info as PaymentMethodInfo).enabled)
                .map(([key]) => key as PaymentMethodKey),
        [paymentConfig],
    );

    // Auto-select the first method when config arrives for the first time
    useEffect(() => {
        if (enabledPayments.length > 0 && selectedPayment === null) {
            setSelectedPayment(enabledPayments[0]);
        }
    }, [enabledPayments, selectedPayment]);

    return {paymentConfig, enabledPayments, selectedPayment, setSelectedPayment};
}
