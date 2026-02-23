import getServiceEndpoint from "../utils/HostnameResolver";
import { GraphQLService } from "./GraphQLService";
import { gql } from "graphql-request";

// Allow environment variable override for production deployments (fallback compatible with existing services)
const envGraphQl = (typeof import.meta !== 'undefined' && (import.meta as any).env)
    ? (((import.meta as any).env.VITE_GRAPHQL_ENDPOINT)
        || ((import.meta as any).env.VITE_API_URL)
        || ((import.meta as any).env.REACT_APP_API_URL))
    : (process?.env?.VITE_GRAPHQL_ENDPOINT || process?.env?.VITE_API_URL || process?.env?.REACT_APP_API_URL);

const graphQlEndpoint = (envGraphQl && envGraphQl.length > 0)
    ? envGraphQl
    : getServiceEndpoint(8080) + '/api/graphql';

// Types mirrored from backend entities
export type StoreSetting = {
    key: string;
    value: string;
    description?: string | null;
};

export type ShippingMethod = {
    id?: number | null;
    name?: string | null;
    isActive?: boolean | null;
    baseFee?: number | null;
    estimatedDays?: string | null;
};

// Payment methods allowed values from settings
export type PaymentMethodKey = 'IN_STORE' | 'FASTPAY';

// Structured config for payment methods (new JSON format)
export type PaymentMethodInfo = {
    displayName: string;
    description?: string | null;
    enabled: boolean;
};

export type PaymentMethodsConfig = Partial<Record<PaymentMethodKey, PaymentMethodInfo>>;

export async function fetchAllSettings(): Promise<StoreSetting[]> {
    const client = await GraphQLService.getGraphQLClient(graphQlEndpoint);
    const query = gql`
        query AllSettings {
            allSettings {
                key
                value
                description
            }
        }
    `;
    const res = await client.request<{ allSettings: StoreSetting[] }>(query);
    return res.allSettings || [];
}

export async function fetchShippingMethods(): Promise<ShippingMethod[]> {
    const client = await GraphQLService.getGraphQLClient(graphQlEndpoint);
    const query = gql`
        query ShippingMethods {
            shippingMethods {
                id
                name
                isActive
                baseFee
                estimatedDays
            }
        }
    `;
    const res = await client.request<{ shippingMethods: ShippingMethod[] }>(query);
    return res.shippingMethods || [];
}

export async function updateSetting(key: string, value: string): Promise<StoreSetting> {
    if (!key) throw new Error("Setting key is required");
    const client = await GraphQLService.getGraphQLClient(graphQlEndpoint);
    const mutation = gql`
        mutation UpdateSetting($key: String!, $value: String!) {
            updateSetting(key: $key, value: $value) {
                key
                value
                description
            }
        }
    `;
    const res = await client.request<{ updateSetting: StoreSetting }>(mutation, { key, value });
    return res.updateSetting;
}

export async function saveShippingMethod(method: ShippingMethod): Promise<ShippingMethod> {
    const client = await GraphQLService.getGraphQLClient(graphQlEndpoint);
    const mutation = gql`
        mutation SaveShippingMethod($method: ShippingMethodEntityInput!) {
            saveShippingMethod(method: $method) {
                id
                name
                isActive
                baseFee
                estimatedDays
            }
        }
    `;
    const res = await client.request<{ saveShippingMethod: ShippingMethod }>(mutation, { method });
    return res.saveShippingMethod;
}

// Helper to fetch and parse allowed payment methods from settings (legacy helper retained)
export async function fetchAllowedPaymentMethods(): Promise<PaymentMethodKey[]> {
    const cfg = await fetchPaymentMethodsConfig();
    const keys = Object.entries(cfg)
        .filter(([_, info]) => !!info && !!(info as PaymentMethodInfo).enabled)
        .map(([key]) => key as PaymentMethodKey);
    return keys.length ? keys : ['FASTPAY'];
}

// New: fetch full payment methods config with labels/descriptions using the new JSON format
export async function fetchPaymentMethodsConfig(): Promise<PaymentMethodsConfig> {
    try {
        const settings = await fetchAllSettings();
        const entry = settings.find(s => s.key === 'payment_methods_allowed');
        const raw = entry?.value ?? '';
        let parsed: any = null;
        try {
            parsed = raw ? JSON.parse(raw) : null;
        } catch (_) {
            // Attempt to handle CSV-like strings e.g. IN_STORE, FASTPAY
            const trimmed = String(raw || '').trim();
            if (trimmed.includes(',')) {
                parsed = trimmed
                    .replace(/^[\[\]]$/g, '')
                    .split(',')
                    .map((s: string) => s.replace(/^[\s\"]+|[\s\"]+$/g, ''));
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
        if (parsed && typeof parsed === 'object') {
            const map: PaymentMethodsConfig = {};
            for (const [rawKey, val] of Object.entries(parsed as Record<string, any>)) {
                const key = normalizeKey(rawKey);
                if (!key) continue;
                const enabledRaw = (val as any)?.enabled;
                const enabled = typeof enabledRaw === 'string' ? enabledRaw.toLowerCase() === 'true' : !!enabledRaw;
                const displayName = String((val as any)?.displayName || (key === 'IN_STORE' ? 'Pay in store' : 'FastPay'));
                const description = (val as any)?.description ?? (key === 'IN_STORE' ? 'Cash/Card at Pickup' : 'Card / Instant EFT / Scan to Pay');
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

