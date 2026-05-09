import {useState} from "react";

import {apiDeleteBrand} from "@/services/graphql/admin/brand/BrandService.graphql.ts";
import {extractTechnicalDetails} from "@/utils/graphqlErrorUtils.ts";

const FRIENDLY_ERROR_MSG = "We couldn't delete the brand right now. Please try again.";

type UseDeleteBrandOptions = {
    onSuccess?: () => void;
    onError?: (error: unknown) => void;
};

export default function useDeleteBrand(options?: UseDeleteBrandOptions) {

    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [technicalDetails, setTechnicalDetails] = useState("");

    const deleteBrand = async (brandId: string) => {
        try {
            setIsLoading(true);
            setErrorMsg("");
            setTechnicalDetails("");
            await apiDeleteBrand(brandId);
            options?.onSuccess?.();
        } catch (error) {
            console.error("Failed to create brand:", error);
            setErrorMsg(FRIENDLY_ERROR_MSG);
            setTechnicalDetails(extractTechnicalDetails(error));
            options?.onError?.(error);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        deleteBrand,
        isLoading,
        errorMsg,
        technicalDetails,
    };
}