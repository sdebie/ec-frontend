import React, { useState } from 'react';
import { ShoppingBag, ShieldCheck, CreditCard } from 'lucide-react';

// Interface shaped like backend HtmlFormField
interface HtmlFormField {
  type: string; // e.g. "hidden"
  name: string;
  value: string;
}

const gatewayPath = 'https://sandbox.payfast.co.za/eng/process';

const CheckoutPayFast: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  // Example Quote Data (This would normally come from your Cart state/context)
  const quote = {
    id: 1024,
    totalAmount: 1250.0,
    items: [{ id: 1, name: 'Premium Leather Portfolio', price: 1250.0, qty: 1 }],
  };

  const handlePayFastCheckout = async () => {
    const debug = true; // new URLSearchParams(window.location.search).has('debug')

    const buildAndSubmitGatewayForm = (fields: HtmlFormField[]) => {
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

      // Allow programmatic submit in some older browsers
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

    try {
      setIsProcessing(true);

      // Determine API base candidates for local and prod
      const isLocalHost =
        window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const apiBases = isLocalHost
        ? ['http://localhost:8080', 'http://192.168.1.39:8080']
        : ['https://ecapi.sdebiehome.co.za'];

      let lastErr: any = null;
      let response: Response | null = null;

      for (const base of apiBases) {
        try {
          if (debug) console.log('[PayFast][DEBUG] Requesting checkout fields from', base);

          // Backend endpoint consumes application/x-www-form-urlencoded
          const body = new URLSearchParams({
            id: String(quote.id),
            totalAmount: quote.totalAmount.toFixed(2),
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

          // Success for this base, stop trying others
          break;
        } catch (e) {
          lastErr = e;
          response = null;
          if (debug)
            console.warn('[PayFast][DEBUG] Failed using base, trying next if available:', e);
        }
      }

      if (!response) throw lastErr || new Error('No response from any API base');

      let fields: HtmlFormField[] = [];
      try {
        fields = (await response.json()) as HtmlFormField[];
      } catch (e) {
        const txt = await response.text().catch(() => '');
        throw new Error('Failed to parse JSON for /api/payments/checkout. Body: ' + txt);
      }

      if (debug) console.log('[PayFast][DEBUG] Received fields:', fields);

      // Build and submit the PayFast gateway form
      buildAndSubmitGatewayForm(fields);
    } catch (error) {
      console.error('[PayFast] Checkout initiation failed:', error);
      alert('Could not initiate payment. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-sm rounded-2xl overflow-hidden border border-gray-100">
          {/* Header */}
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <ShoppingBag className="text-blue-600" /> Checkout (Gateway Submit)
            </h1>
            <span className="text-sm text-gray-500">Order #{quote.id}</span>
          </div>

          <div className="p-8">
            {/* Order Summary */}
            <div className="space-y-4 mb-8">
              {quote.items.map((item) => (
                <div key={item.id} className="flex justify-between text-gray-700">
                  <span>
                    {item.name} (x{item.qty})
                  </span>
                  <span className="font-medium">R {item.price.toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t pt-4 flex justify-between text-xl font-bold text-gray-900">
                <span>Total Amount</span>
                <span className="text-blue-600">R {quote.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Button */}
            <button
              onClick={handlePayFastCheckout}
              disabled={isProcessing}
              className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl font-bold text-white shadow-lg transition-all ${
                isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
              }`}
            >
              <CreditCard size={20} />
              {isProcessing ? 'Preparing Secure Gateway...' : 'Pay via PayFast (Gateway)'}
            </button>

            {/* Trust Badges */}
            <div className="mt-8 grid grid-cols-2 gap-4 border-t pt-6">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <ShieldCheck className="text-green-500" size={16} />
                Secure 256-bit SSL Encryption
              </div>
              <div className="flex items-center justify-end">
                <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Sandbox Mode</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPayFast;
