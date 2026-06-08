import {useCallback, useEffect, useState} from "react";
import {apiGetShippingMethods} from "@/services/graphql/admin/settings/SettingsService.graphql.ts";
import {ShippingMethod} from "@/types/admin/SettingsTypes.ts";

type UseGetShippingMethodsOptions = {
    onError?: (error: unknown) => void;
    autoFetch?: boolean;
};

export default function useGetShippingMethods(options?: UseGetShippingMethodsOptions) {
    const onError = options?.onError;
    const autoFetch = options?.autoFetch ?? true;
    const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");

    const fetchShippingMethods = useCallback(async () => {
        try {
            setIsLoading(true);
            setErrorMsg("");
            const data = await apiGetShippingMethods();
            setShippingMethods(data);
        } catch (error) {
            console.error("Failed to fetch shipping methods:", error);
            setErrorMsg("Failed to load shipping methods");
            onError?.(error);
        } finally {
            setIsLoading(false);
        }
    }, [onError]);

    useEffect(() => {
        if (!autoFetch) return;
        fetchShippingMethods();
    }, [fetchShippingMethods, autoFetch]);

    return {
        shippingMethods,
        isLoading,
        errorMsg,
        fetchShippingMethods,
    };
}

