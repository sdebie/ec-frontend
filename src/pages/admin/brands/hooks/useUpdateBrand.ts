import {useState} from "react";
import {Brand} from "@/types/admin/BrandTypes.ts";
import {apiUpdateBrand} from "@/services/graphql/admin/brand/BrandService.ts";
import {extractTechnicalDetails} from "@/utils/graphqlErrorUtils.ts";

const FRIENDLY_ERROR_MSG = "We couldn't save your changes right now. Please try again.";

type UseEditBrandOptions = {
    onSuccess?: () => void;
    onError?: (error: unknown) => void;
};

export default function useUpdateBrand(options?: UseEditBrandOptions) {
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [technicalDetails, setTechnicalDetails] = useState("");

    const updateBrand = async (brand: Brand) => {
        const {id, ...brandDto} = brand;
        if (!id) {
            setErrorMsg("Brand id is required to update.");
            setTechnicalDetails("");
            return;
        }
        try {
            setIsLoading(true);
            setErrorMsg("");
            setTechnicalDetails("");
            await apiUpdateBrand(id, brandDto);
            options?.onSuccess?.();
        } catch (error) {
            console.error("Failed to update brand:", error);
            setErrorMsg(FRIENDLY_ERROR_MSG);
            setTechnicalDetails(extractTechnicalDetails(error));
            options?.onError?.(error);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        updateBrand,
        isLoading,
        errorMsg,
        technicalDetails,
    };
}

