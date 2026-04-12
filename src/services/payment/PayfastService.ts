export interface HtmlFormField {
    type: string;
    name: string;
    value: string;
}

const gatewayPath = 'https://sandbox.payfast.co.za/eng/process';

export const submitPayFastForm = (fields: HtmlFormField[]) => {
    if (!Array.isArray(fields) || fields.length === 0) {
        throw new Error('No form fields returned by API.');
    }

    const form = document.createElement('form');
    form.setAttribute('method', 'POST');
    form.setAttribute('action', gatewayPath);

    fields.forEach((f) => {
        const input = document.createElement('input');
        input.setAttribute('type', f.type || 'hidden');
        input.setAttribute('name', f.name);
        input.setAttribute('value', f.value ?? '');
        form.appendChild(input);
    });

    // @ts-ignore
    form._submit_function_ = form.submit;

    document.body.appendChild(form);

    // @ts-ignore
    if (typeof form._submit_function_ === 'function') {
        // @ts-ignore
        form._submit_function_();
    } else {
        form.submit();
    }
};

export const requestPayFastFields = async (
    orderId: string | number,
    totalAmount: number,
    debug = false
): Promise<HtmlFormField[]> => {
    const isLocalHost =
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1';

    const apiBases = isLocalHost
        ? ['http://localhost:8080', 'http://127.0.0.1:8080']
        : ['https://ecapi.sdebiehome.co.za'];

    let lastErr: unknown = null;
    let response: Response | null = null;

    for (const base of apiBases) {
        try {
            if (debug) console.log('[PayFast][DEBUG] Requesting checkout fields from', base);

            const body = new URLSearchParams({
                id: String(orderId),
                totalAmount: Number(totalAmount).toFixed(2),
            });

            response = await fetch(`${base}/api/payments/checkout`, {
                method: 'POST',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
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
            if (debug) {
                console.warn('[PayFast][DEBUG] Failed using base, trying next if available:', e);
            }
        }
    }

    if (!response) {
        throw lastErr || new Error('No response from any API base');
    }

    try {
        return (await response.json()) as HtmlFormField[];
    } catch {
        throw new Error('Failed to parse PayFast response JSON.');
    }
};