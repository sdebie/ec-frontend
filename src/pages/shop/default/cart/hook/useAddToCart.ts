import {useState} from "react";
import { addToCart as addToCartService } from "@/services/graphql/order/OrderService.graphql.ts";
import { OrderData } from "@/types/order.types.ts";

export function useAddToCart() {

    const [createLoading, setCreateLoading] = useState(false);
    const [createError, setCreateError] = useState<Error | null>(null);

    async function addToCart(orderDetail: {
        items: { quantity: number; unitPrice: number; variant: string }[]
    }): Promise<OrderData> {
        console.log("DEBUG:: Creating order: ", orderDetail);
        setCreateLoading(true);
        setCreateError(null);

        try {
            // Delegate to common service; it updates CartStore internally
            const result = await addToCartService(orderDetail);
            return result;
        } catch (err) {
            setCreateError(err as Error);
            throw err;
        } finally {
            setCreateLoading(false);
        }
    }

    return {createOrder: addToCart, createLoading, createError};
}
