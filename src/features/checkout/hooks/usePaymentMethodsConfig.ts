import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';

import {
    fetchPaymentMethodsConfig,
    type PaymentMethodInfo,
    type PaymentMethodKey,
    type PaymentMethodsConfig,
} from '@/services/StoreSettings.ts';

/**
 * Loads enabled payment methods from Store Settings (§5 deviation: internal fetch until Phase 1 adds payments block to StorefrontClientConfig).
 */
export function usePaymentMethodsConfig(): {
    paymentConfig: PaymentMethodsConfig;
    enabledPayments: PaymentMethodKey[];
    selectedPayment: PaymentMethodKey | null;
    setSelectedPayment: Dispatch<SetStateAction<PaymentMethodKey | null>>;
} {
    const [paymentConfig, setPaymentConfig] = useState<PaymentMethodsConfig>({});
    const [enabledPayments, setEnabledPayments] = useState<PaymentMethodKey[]>([]);
    const [selectedPayment, setSelectedPayment] = useState<PaymentMethodKey | null>(null);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            try {
                const cfg = await fetchPaymentMethodsConfig();
                if (cancelled) return;
                setPaymentConfig(cfg);
                const keys = Object.entries(cfg)
                    .filter(([_, info]) => !!info && (info as PaymentMethodInfo).enabled)
                    .map(([key]) => key as PaymentMethodKey);
                setEnabledPayments(keys);
                setSelectedPayment((prev) => prev ?? (keys[0] || null));
            } catch (e) {
                console.warn('Failed to load payment methods', e);
                if (!cancelled) {
                    setPaymentConfig({});
                    setEnabledPayments([]);
                    setSelectedPayment(null);
                }
            }
        };
        void load();
        return () => {
            cancelled = true;
        };
    }, []);

    return { paymentConfig, enabledPayments, selectedPayment, setSelectedPayment };
}
