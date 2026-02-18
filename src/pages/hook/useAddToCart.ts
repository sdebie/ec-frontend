import {useState} from "react";
import {apiAddToCart} from "../../services/OrderService";
import { OrderData } from "../types";
import { CartStore } from "../../state/CartStore";

export function useAddToCart() {

    const [createLoading, setCreateLoading] = useState(false);
    const [createError, setCreateError] = useState<Error | null>(null);

    async function addToCart(orderDetail: OrderData): Promise<OrderData> {
        console.log("DEBUG:: Creating order: ", orderDetail);
        setCreateLoading(true);
        setCreateError(null);

        try {
            const result = await apiAddToCart<OrderData>(
                orderDetail
            );
            // Update cart badge count globally
            CartStore.setFromOrder(result as OrderData);
            return result as OrderData;
        } catch (err) {
            setCreateError(err as Error);
            throw err;
        } finally {
            setCreateLoading(false);
        }
    }

    return {createOrder: addToCart, createLoading, createError};
}
