import {useState} from "react";
import {apiAddToCart} from "../../services/OrderService";
import { OrderData } from "../types";

export function useAddToCart() {

    const [createLoading, setCreateLoading] = useState(false);
    const [createError, setCreateError] = useState<Error | null>(null);

    async function addToCart(orderDetail: OrderData): Promise<OrderData> {
        console.log("DEBUG:: Creating order: ", orderDetail);
        setCreateLoading(true);
        setCreateError(null);

        try {
            return await apiAddToCart<OrderData>(
                orderDetail
            );
        } catch (err) {
            setCreateError(err as Error);
            throw err;
        } finally {
            setCreateLoading(false);
        }
    }

    return {createOrder: addToCart, createLoading, createError};
}
