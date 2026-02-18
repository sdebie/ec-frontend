import {useState} from "react";
import {apiCreateOrder} from "../../services/OrderService";

export function useCreateOrder() {

    const [createLoading, setCreateLoading] = useState(false);
    const [createError, setCreateError] = useState<Error | null>(null);

    async function createOrder(orderDetail: any) {
        setCreateLoading(true);
        setCreateError(null);

        try {
            return await apiCreateOrder<any>(
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
