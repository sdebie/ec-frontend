import {useState} from "react";
import {apiSaveShippingMethod} from "@/services/graphql/admin/settings/SettingsService.graphql.ts";
import {ShippingMethod} from "@/types/admin/SettingsTypes.ts";
import {extractTechnicalDetails} from "@/utils/graphqlErrorUtils.ts";

const FRIENDLY_ERROR_MSG = "We couldn't create the shipping method right now. Please try again.";

type UseCreateShippingMethodOptions = {
    onSuccess?: () => void;
    onError?: (error: unknown) => void;
};

export default function useCreateShippingMethod(options?: UseCreateShippingMethodOptions) {

    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [technicalDetails, setTechnicalDetails] = useState("");

    const createShippingMethod = async (methodDto: Omit<ShippingMethod, "id">) => {
        try {
            setIsLoading(true);
            setErrorMsg("");
            setTechnicalDetails("");
            await apiSaveShippingMethod(methodDto);
            options?.onSuccess?.();
        } catch (error) {
            console.error("Failed to create shipping method:", error);
            setErrorMsg(FRIENDLY_ERROR_MSG);
            setTechnicalDetails(extractTechnicalDetails(error));
            options?.onError?.(error);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        createShippingMethod,
        isLoading,
        errorMsg,
        technicalDetails,
    };
}

