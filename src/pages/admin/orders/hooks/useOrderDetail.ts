import { useEffect, useState } from "react";

import { apiGetOrderDetail } from "@/services/graphql/order/OrderService.graphql.ts";
import { OrderDetailData } from "@/types/order.types.ts";

export default function useOrderDetail(orderId?: string) {
    const [order, setOrder] = useState<OrderDetailData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        if (!orderId) return;

        let cancelled = false;

        const load = async () => {
            setIsLoading(true);
            setErrorMsg(null);
            try {
                const result = await apiGetOrderDetail(orderId);
                if (!cancelled) setOrder(result);
            } catch (e: unknown) {
                if (!cancelled) setErrorMsg(e instanceof Error ? e.message : "Failed to load order detail");
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };

        void load();

        return () => {
            cancelled = true;
        };
    }, [orderId]);

    return { order, isLoading, errorMsg };
}

