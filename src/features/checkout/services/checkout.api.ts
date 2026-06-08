import getServiceEndpoint from "@/utils/HostnameResolver.ts";

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
    const baseUrl = getServiceEndpoint(8080) || '/api';
    
    try {
        const body = new URLSearchParams({
            id: String(orderId),
            totalAmount: Number(totalAmount).toFixed(2),
        });

        const response = await fetch(`${baseUrl}/payments/checkout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: body.toString(),
        });

        if (!response.ok) {
            const txt = await response.text().catch(() => '');
            throw new Error(`HTTP ${response.status} ${response.statusText} ${txt}`);
        }

        return (await response.json()) as PayfastFormField[];
    } catch (e) {
        console.error('Failed to fetch Payfast checkout fields:', e);
        throw e;
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
