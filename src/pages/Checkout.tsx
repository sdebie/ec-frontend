import React, { useState } from 'react';
import { ShoppingBag, ShieldCheck, CreditCard } from 'lucide-react';

const Checkout = () => {
    const [isProcessing, setIsProcessing] = useState(false);

    // Example Quote Data (This would normally come from your Cart state/context)
    const quote = {
        id: 1024,
        totalAmount: 1250.00,
        items: [
            { id: 1, name: "Premium Leather Portfolio", price: 1250.00, qty: 1 }
        ]
    };

    const handlePayFastPayment = async () => {
        // Small helper to wait for the PayFast engine to attach its function to window
        const waitForPayFastEngine = async (timeoutMs = 6000, intervalMs = 200) => {
            const start = Date.now();
            while (Date.now() - start < timeoutMs) {
                const fn = (window as any).payfast_do_onsite_payment || (window as any).payfast_do_onsite;
                if (typeof fn === 'function') return fn;
                await new Promise(r => setTimeout(r, intervalMs));
            }
            return undefined;
        };

        const debug = true;//new URLSearchParams(window.location.search).has('debug');
        if (debug) console.log('[PayFast][DEBUG] Clicked Pay button');

        setIsProcessing(true);

        try {
            // Determine API base candidates for local and prod
            const isLocalHost = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
            const apiBases = isLocalHost
                ? ['http://localhost:8080', 'http://192.168.1.39:8080']
                : ['https://ecapi.sdebiehome.co.za'];

            let lastErr: any = null;
            let response: Response | null = null;

            // Try each base until one succeeds
            for (const base of apiBases) {
                try {
                    if (debug) console.log('[PayFast][DEBUG] Requesting payment session from', base);
                    response = await fetch(`${base}/api/payments/request`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: quote.id, totalAmount: quote.totalAmount })
                    });
                    if (!response.ok) {
                        const txt = await response.text().catch(() => '');
                        throw new Error(`HTTP ${response.status} ${response.statusText} ${txt}`);
                    }
                    // If we reach here, we got a good response
                    break;
                } catch (e) {
                    lastErr = e;
                    response = null;
                    if (debug) console.warn('[PayFast][DEBUG] Failed using base, trying next if available:', base, e);
                }
            }

            if (!response) throw lastErr || new Error('No response from any API base');

            // Parse JSON safely
            let uuid: string | undefined;
            try {
                const data = await response.json();
                uuid = data?.uuid;
            } catch (e) {
                const txt = await response.text().catch(() => '');
                throw new Error('Failed to parse JSON for /api/payments/request. Body: ' + txt);
            }

            if (!uuid) throw new Error('Missing uuid in API response');
            if (debug) console.log('[PayFast][DEBUG] Received UUID:', uuid);

            // Wait for engine to be available and pick the correct function
            const payfastFn = await waitForPayFastEngine();
            if (typeof payfastFn !== 'function') {
                console.error('PayFast engine not loaded. Make sure engine.js is included and not blocked by extensions.');
                setIsProcessing(false);
                return;
            }

            if (debug) console.log('[PayFast][DEBUG] Launching PayFast modal using', (payfastFn === (window as any).payfast_do_onsite_payment) ? 'payfast_do_onsite_payment' : 'payfast_do_onsite');

            payfastFn({
                uuid,
                callback: (result: boolean | string) => {
                    if (debug) console.log('[PayFast][DEBUG] Callback result:', result);
                    if (result === true) {
                        window.location.href = `/payment-success?quoteId=${quote.id}`;
                    } else {
                        setIsProcessing(false);
                        if (result !== false) console.warn('[PayFast] Payment not completed:', result);
                    }
                },
                before_on_continue: () => {
                    if (debug) console.log('[PayFast][DEBUG] User clicked continue inside modal');
                },
                before_close: () => {
                    if (debug) console.log('[PayFast][DEBUG] Modal is about to close');
                }
            });
        } catch (error) {
            console.error('[PayFast] Payment initiation failed:', error);
            alert('Could not initiate payment. Please try again.');
            setIsProcessing(false);
        }
    };

    // const handlePayFastPayment = async () => {
    //     setIsProcessing(true);
    //
    //     try {
    //         // 1. Request signed payment data & UUID from Quarkus
    //         const apiBase = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    //             ? 'http://localhost:8080'
    //             : 'https://kwapi.sdebiehome.co.za';
    //
    //         const response = await fetch(`${apiBase}/api/payments/request`, {
    //             method: 'POST',
    //             headers: { 'Content-Type': 'application/json' },
    //             body: JSON.stringify({
    //                 id: quote.id,
    //                 totalAmount: quote.totalAmount
    //             })
    //         });
    //
    //         if (!response.ok) throw new Error("Failed to fetch payment session");
    //
    //         const { uuid } = await response.json();
    //
    //         // 2. Launch the PayFast Onsite Modal
    //         // The window.payfast_do_onsite function is provided by the engine.js script in index.html
    //         window.payfast_do_onsite({
    //             uuid: uuid,
    //             callback: (result) => {
    //                 if (result === true) {
    //                     // Redirect to your success page
    //                     window.location.href = `https://kw.sdebiehome.co.za/payment-success?quoteId=${quote.id}`;
    //                 } else {
    //                     setIsProcessing(false);
    //                     console.log("Payment was closed or failed.");
    //                 }
    //             },
    //             before_on_continue: () => {
    //                 console.log("User clicked continue inside modal");
    //             }
    //         });
    //
    //     } catch (error) {
    //         console.error("Payment Error:", error);
    //         alert("Could not initiate payment. Please try again.");
    //         setIsProcessing(false);
    //     }
    // };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white shadow-sm rounded-2xl overflow-hidden border border-gray-100">

                    {/* Header */}
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <ShoppingBag className="text-blue-600" /> Complete Purchase
                        </h1>
                        <span className="text-sm text-gray-500">Order #{quote.id}</span>
                    </div>

                    <div className="p-8">
                        {/* Order Summary */}
                        <div className="space-y-4 mb-8">
                            {quote.items.map(item => (
                                <div key={item.id} className="flex justify-between text-gray-700">
                                    <span>{item.name} (x{item.qty})</span>
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
                            onClick={handlePayFastPayment}
                            disabled={isProcessing}
                            className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl font-bold text-white shadow-lg transition-all
                ${isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'}`}
                        >
                            <CreditCard size={20} />
                            {isProcessing ? "Opening Secure Portal..." : "Secure Pay with PayFast"}
                        </button>

                        {/* Trust Badges */}
                        <div className="mt-8 grid grid-cols-2 gap-4 border-t pt-6">
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                <ShieldCheck className="text-green-500" size={16} />
                                Secure 256-bit SSL Encryption
                            </div>
                            <div className="flex items-center justify-end">
                                {/* Add PayFast/Visa/Mastercard logos here */}
                                <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Sandbox Mode</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;