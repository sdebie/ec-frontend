import {
    apiGetCountrySettings,
    apiGetShippingMethods,
    apiGetStoreSettings,
} from "./graphql/admin/settings/SettingsService.graphql.ts";
export { apiGetShippingMethods, apiGetStoreSettings };
import type { StoreSetting } from '@/types/admin/SettingsTypes.ts';
import type { CountrySetting, ShippingMethod } from '@/types/shared/SettingsTypes.ts';
export type { StoreSetting, ShippingMethod, CountrySetting };

// Payment methods allowed values from settings
export type PaymentMethodKey = 'IN_STORE' | 'FASTPAY';

export async function fetchCountrySettings(): Promise<CountrySetting[]> {
    return apiGetCountrySettings();
}

// Structured config for payment methods (new JSON format)
export type PaymentMethodInfo = {
    displayName: string;
    description?: string | null;
    enabled: boolean;
};

export type PaymentMethodsConfig = Partial<Record<PaymentMethodKey, PaymentMethodInfo>>;


export async function fetchAllowedPaymentMethods(): Promise<PaymentMethodKey[]> {
    const cfg = await fetchPaymentMethodsConfig();
    const keys = Object.entries(cfg)
        .filter(([_, info]) => !!info && (info as PaymentMethodInfo).enabled)
        .map(([key]) => key as PaymentMethodKey);
    return keys.length ? keys : ['FASTPAY'];
}

// New: fetch full payment methods config with labels/descriptions using the new JSON format
export async function fetchPaymentMethodsConfig(): Promise<PaymentMethodsConfig> {
    try {
        const settings = await apiGetStoreSettings();
        const entry = settings.find((s: StoreSetting) => s.key === 'payment_methods_allowed');
        const raw = entry?.value ?? '';
        let parsed: unknown = null;
        try {
            parsed = raw ? JSON.parse(raw) : null;
        } catch {
            // Attempt to handle CSV-like strings e.g. IN_STORE, FASTPAY
            const trimmed = String(raw || '').trim();
            if (trimmed.includes(',')) {
                parsed = trimmed
                    .replace(/^([\[\]])$/g, '')
                    .split(',')
                    .map((s: string) => s.replace(/^[\s"]+|[\s"]+$/g, ''));
            }
        }

        const normalizeKey = (v: string): PaymentMethodKey | undefined => {
            const up = String(v || '').toUpperCase().trim();
            const k = up === 'PAYFAST' ? 'FASTPAY' : up;
            if (k === 'FASTPAY' || k === 'IN_STORE') return k as PaymentMethodKey;
            return undefined;
        };

        const defaultInfoFor = (key: PaymentMethodKey): PaymentMethodInfo => {
            if (key === 'IN_STORE') {
                return { displayName: 'Pay in store', description: 'Cash/Card at Pickup', enabled: true };
            }
            return { displayName: 'FastPay', description: 'Card / Instant EFT / Scan to Pay', enabled: true };
        };

        // Legacy: array -> build map with defaults
        if (Array.isArray(parsed)) {
            const map: PaymentMethodsConfig = {};
            for (const v of parsed) {
                const key = normalizeKey(String(v));
                if (!key) continue;
                map[key] = defaultInfoFor(key);
            }
            // Fallback
            if (Object.keys(map).length === 0) {
                map.FASTPAY = defaultInfoFor('FASTPAY');
            }
            return map;
        }

        // New: object map -> normalize keys and coerce enabled
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            const map: PaymentMethodsConfig = {};
            for (const [rawKey, val] of Object.entries(parsed as Record<string, unknown>)) {
                const key = normalizeKey(rawKey);
                if (!key) continue;
                const valObj = val && typeof val === 'object' ? val as Record<string, unknown> : null;
                const enabledRaw = valObj?.['enabled'];
                const enabled = typeof enabledRaw === 'string' ? enabledRaw.toLowerCase() === 'true' : !!enabledRaw;
                const displayName = String(valObj?.['displayName'] || (key === 'IN_STORE' ? 'Pay in store' : 'FastPay'));
                const descRaw = valObj?.['description'];
                const description = typeof descRaw === 'string' ? descRaw : (key === 'IN_STORE' ? 'Cash/Card at Pickup' : 'Card / Instant EFT / Scan to Pay');
                map[key] = { displayName, description, enabled };
            }
            // Ensure at least FASTPAY present if all filtered out
            if (!Object.keys(map).length) {
                map.FASTPAY = defaultInfoFor('FASTPAY');
            }
            return map;
        }

        // Fallback default map
        return { FASTPAY: defaultInfoFor('FASTPAY') };
    } catch (e) {
        console.warn('Failed to load payment methods config from settings, defaulting to FASTPAY', e);
        return { FASTPAY: { displayName: 'FastPay', description: 'Card / Instant EFT / Scan to Pay', enabled: true } };
    }
}
