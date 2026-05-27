/** PayFast hosted gateway (sandbox). Production URL differs per merchant setup. */
export const PAYFAST_SANDBOX_GATEWAY_URL = 'https://sandbox.payfast.co.za/eng/process';

export type PayfastFormField = {
    type: string;
    name: string;
    value: string;
};

/**
 * POST /api/payments/checkout — PayFast form fields for redirect (checkout feature only).
 */
export async function fetchPayfastCheckoutFields(orderId: string, totalAmount: number): Promise<PayfastFormField[]> {
    const isLocalHost =
        typeof window !== 'undefined' &&
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    ///const apiBases = isLocalHost ? ['http://localhost:8080', 'http://127.0.0.1:8080'] : ['https://ecapi.sdebiehome.co.za'];
    const apiBases = isLocalHost ? ['http://localhost:8080', 'http://127.0.0.1:8080'] : ['http://192.168.1.16:8080'];

    let lastErr: unknown = null;
    let response: Response | null = null;

    for (const base of apiBases) {
        try {
            const body = new URLSearchParams({
                id: String(orderId),
                totalAmount: Number(totalAmount).toFixed(2),
            });

            response = await fetch(`${base}/api/payments/checkout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: body.toString(),
            });

            if (!response.ok) {
                const txt = await response.text().catch(() => '');
                throw new Error(`HTTP ${response.status} ${response.statusText} ${txt}`);
            }

            break;
        } catch (e) {
            lastErr = e;
            response = null;
        }
    }

    if (!response) throw lastErr ?? new Error('No response from any API base');

    try {
        return (await response.json()) as PayfastFormField[];
    } catch {
        const txt = await response.text().catch(() => '');
        throw new Error('Failed to parse JSON for /api/payments/checkout. Body: ' + txt);
    }
}

export function submitPayfastRedirectForm(fields: PayfastFormField[], gatewayUrl: string = PAYFAST_SANDBOX_GATEWAY_URL): void {
    if (!Array.isArray(fields) || fields.length === 0) {
        throw new Error('No form fields returned by API.');
    }
    const form = document.createElement('form');
    form.setAttribute('method', 'POST');
    form.setAttribute('action', gatewayUrl);

    fields.forEach((f) => {
        const input = document.createElement('input');
        input.setAttribute('type', f.type || 'hidden');
        input.setAttribute('name', f.name);
        input.setAttribute('value', f.value ?? '');
        form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
}
