import {useState} from "react";
import {Brand} from "@/types/admin/BrandTypes.ts";
import {apiCreateBrand} from "@/services/graphql/admin/brand/BrandService.ts";
import {extractTechnicalDetails} from "@/utils/graphqlErrorUtils.ts";

const FRIENDLY_ERROR_MSG = "We couldn't create the brand right now. Please try again.";

type UseCreateBrandOptions = {
    onSuccess?: () => void;
    onError?: (error: unknown) => void;
};

export default function useCreateBrand(options?: UseCreateBrandOptions) {

    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [technicalDetails, setTechnicalDetails] = useState("");

    const createBrand = async (brandDto: Omit<Brand, "id">) => {
        try {
            setIsLoading(true);
            setErrorMsg("");
            setTechnicalDetails("");
            await apiCreateBrand(brandDto);
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
        createBrand,
        isLoading,
        errorMsg,
        technicalDetails,
    };
}

