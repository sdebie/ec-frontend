import {useEffect, useState} from 'react';

import {OrderStatus} from '@/constants/enums/OrderStatus.ts';
import {apiOrderById, apiOrderBySessionId} from '@/services/graphql/order/OrderService.graphql.ts';
import type {OrderData} from '@/types/order.types.ts';
import {cartStore} from '@/store/storefrontCartStore.ts';

export function PaymentSuccess() {
    const [verified, setVerified] = useState(false);

    useEffect(() => {
        // Poll your backend (via GraphQL) to see if the ITN updated the status
        const params = new URLSearchParams(window.location.search);
        const urlSessionId = params.get('sessionId') || undefined;
        const urlOrderId = params.get('orderId') || undefined;
        const sessionId = urlSessionId ?? cartStore.getOrderSessionId() ?? undefined;

        const interval = setInterval(async () => {
            try {
                console.log('Polling order status...');
                let data: OrderData | null = null;
                if (sessionId) {
                    // Prefer polling by session id if available
                    data = await apiOrderBySessionId(sessionId);
                } else if (urlOrderId) {
                    const idParam = String(urlOrderId);
                    if (!idParam || idParam.length < 8) {
                        console.warn('Invalid orderId in URL, skipping poll cycle');
                        return;
                    }
                    data = await apiOrderById(idParam);
                } else {
                    console.warn('No sessionId or orderId provided, skipping poll cycle');
                    return;
                }

                if (data?.status === OrderStatus.PAID) {
                    setVerified(true);
                    clearInterval(interval);
                    cartStore.clear();
                    cartStore.resetAndNewSession();
                }
            } catch (e) {
                console.error('Polling order status failed', e);
            }
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center mt-20">
            <div className={`p-10 rounded-full ${verified ? 'bg-green-100' : 'bg-blue-100'} animate-pulse`}>
                {verified ? "✅" : "⏳"}
            </div>
            <h1 className="text-3xl font-bold mt-6">
                {verified ? "Payment Confirmed!" : "Verifying Payment..."}
            </h1>
        </div>
    );
};

export default PaymentSuccess;