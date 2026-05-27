export type CheckoutAttribute = {
    label: string;
    value: string;
};

export function formatCurrency(amount: number): string {
    return `R${Number(amount || 0).toFixed(2)}`;
}

export function toDisplayLabel(key: string): string {
    return String(key || '')
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .replace(/[_-]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/^./, (s) => s.toUpperCase());
}

function valueToString(value: unknown): string {
    if (value == null) return '';
    if (Array.isArray(value)) {
        return value
            .map((v) => valueToString(v))
            .filter(Boolean)
            .join(', ');
    }
    if (typeof value === 'object') {
        return Object.entries(value as Record<string, unknown>)
            .map(([k, v]) => `${toDisplayLabel(k)}: ${valueToString(v)}`)
            .filter(Boolean)
            .join(', ');
    }
    return String(value).trim();
}

// Safely parse variant attributes for summary display; never throws.
export function parseAttributesJson(attributesJson?: string): CheckoutAttribute[] {
    const raw = String(attributesJson || '').trim();
    if (!raw) return [];

    try {
        const parsed = JSON.parse(raw) as unknown;

        if (Array.isArray(parsed)) {
            return parsed
                .map((entry, index) => {
                    if (entry && typeof entry === 'object' && !Array.isArray(entry)) {
                        const obj = entry as Record<string, unknown>;
                        const [key, value] = Object.entries(obj)[0] || [];
                        if (!key) return null;
                        return { label: toDisplayLabel(key), value: valueToString(value) };
                    }
                    const text = valueToString(entry);
                    if (!text) return null;
                    return { label: `Option ${index + 1}`, value: text };
                })
                .filter((v): v is CheckoutAttribute => !!v && !!v.value);
        }

        if (parsed && typeof parsed === 'object') {
            return Object.entries(parsed as Record<string, unknown>)
                .map(([key, value]) => ({ label: toDisplayLabel(key), value: valueToString(value) }))
                .filter((entry) => !!entry.value);
        }

        const plain = valueToString(parsed);
        return plain ? [{ label: 'Details', value: plain }] : [];
    } catch {
        return [{ label: 'Details', value: raw }];
    }
}

export function isInStorePickup(name?: string | null): boolean {
    const normalized = String(name || '').toLowerCase().trim();
    return (
        normalized === 'in-store pickup' ||
        normalized === 'in store pickup' ||
        normalized === 'instore pickup' ||
        normalized === 'pickup' ||
        normalized === 'collect'
    );
}
