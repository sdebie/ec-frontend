import { useEffect, useState } from 'react';

import { apiGetStoreSettings } from '@/services/graphql/admin/settings/SettingsService.graphql.ts';

export type UvhDetailFeature = { id: string; label: string };
export type UvhDetailTrustBadge = { id: string; label: string };

export type UvhProductDetailConfig = {
    features: UvhDetailFeature[];
    trustBadges: UvhDetailTrustBadge[];
    shippingCopy: string[];
    bulkCopy: string[];
    idealForDefault: string[];
};

const FALLBACK: UvhProductDetailConfig = {
    features: [
        { id: 'durable', label: 'Durable & Reliable' },
        { id: 'seal', label: 'Secure Seal' },
        { id: 'bulk', label: 'Bulk Packs Available' },
    ],
    trustBadges: [
        { id: 'delivery', label: 'Nationwide Delivery' },
        { id: 'bulk-pricing', label: 'Bulk Pricing Available' },
        { id: 'vat', label: 'VAT Registered Supplier' },
        { id: 'support', label: 'Expert Support & Advice' },
    ],
    shippingCopy: [
        'Orders are dispatched from our warehouse once payment is confirmed.',
        'Standard delivery timelines apply based on your region and order size.',
        'Bulk and wholesale orders may qualify for dedicated dispatch scheduling — contact our team for lead times.',
    ],
    bulkCopy: [
        'Volume pricing is available for registered wholesale accounts.',
        'Apply for a wholesale account to unlock tiered pricing on eligible product lines.',
        'For large one-off orders, request a quote and our sales team will respond within one business day.',
    ],
    idealForDefault: [
        'Food packaging and storage',
        'Medical and laboratory supplies',
        'Retail and hospitality consumables',
        'Workshop and industrial organisation',
    ],
};

function safeParseJson<T>(value: string | undefined, fallback: T): T {
    if (!value) return fallback;
    try {
        return JSON.parse(value) as T;
    } catch {
        return fallback;
    }
}

export function useUvhProductDetailConfig(): UvhProductDetailConfig {
    const [config, setConfig] = useState<UvhProductDetailConfig>(FALLBACK);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                const settings = await apiGetStoreSettings();
                if (cancelled) return;

                const get = (key: string) => settings.find((s) => s.key === key)?.value;

                setConfig({
                    features: safeParseJson(get('product_detail_features'), FALLBACK.features),
                    trustBadges: safeParseJson(get('product_detail_trust_badges'), FALLBACK.trustBadges),
                    shippingCopy: safeParseJson(get('product_detail_shipping_copy'), FALLBACK.shippingCopy),
                    bulkCopy: safeParseJson(get('product_detail_bulk_copy'), FALLBACK.bulkCopy),
                    idealForDefault: safeParseJson(get('product_detail_ideal_for_default'), FALLBACK.idealForDefault),
                });
            } catch {
                // Fallback values already set as initial state
            }
        };

        void load();
        return () => { cancelled = true; };
    }, []);

    return config;
}
