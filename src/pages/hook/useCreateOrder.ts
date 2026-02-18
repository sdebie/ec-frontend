import {useState} from "react";
import {apiCreateOrder} from "../../services/OrderService";
import { OrderData } from "../types";

export function useCreateOrder() {

    const [createLoading, setCreateLoading] = useState(false);
    const [createError, setCreateError] = useState<Error | null>(null);

    async function createOrder(orderDetail: OrderData): Promise<OrderData> {
        console.log("DEBUG:: Creating order: ", orderDetail);
        setCreateLoading(true);
        setCreateError(null);

        try {
            return await apiCreateOrder<OrderData>(
                orderDetail
            );
        } catch (err) {
            setCreateError(err as Error);
            throw err;
        } finally {
            setCreateLoading(false);
        }
    }

    return {createOrder, createLoading, createError};
}
