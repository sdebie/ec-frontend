import {useState} from "react";
import {ShippingMethod} from "@/types/admin/SettingsTypes.ts";
import {apiSaveShippingMethod} from "@/services/graphql/admin/settings/settings.service.ts";
import {extractTechnicalDetails} from "@/utils/graphqlErrorUtils.ts";

const FRIENDLY_ERROR_MSG = "We couldn't save your changes right now. Please try again.";

type UseEditShippingMethodOptions = {
    onSuccess?: () => void;
    onError?: (error: unknown) => void;
};

export default function useEditShippingMethod(options?: UseEditShippingMethodOptions) {
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [technicalDetails, setTechnicalDetails] = useState("");

    const updateShippingMethod = async (method: ShippingMethod) => {
        if (!method.id) {
            setErrorMsg("Shipping method id is required to update.");
            setTechnicalDetails("");
            return;
        }

        try {
            setIsLoading(true);
            setErrorMsg("");
            setTechnicalDetails("");
            await apiSaveShippingMethod(method);
            options?.onSuccess?.();
        } catch (error) {
            console.error("Failed to update shipping method:", error);
            setErrorMsg(FRIENDLY_ERROR_MSG);
            setTechnicalDetails(extractTechnicalDetails(error));
            options?.onError?.(error);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        updateShippingMethod,
        isLoading,
        errorMsg,
        technicalDetails,
    };
}

