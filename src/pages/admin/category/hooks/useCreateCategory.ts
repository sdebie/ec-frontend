import {useState} from "react";

import {apiCreateCategory} from "@/services/graphql/admin/category/CategoryService.graphql.ts";
import {Category} from "@/types/admin/CategoryTypes.ts";
import {extractTechnicalDetails} from "@/utils/graphqlErrorUtils.ts";


const FRIENDLY_ERROR_MSG = "We couldn't create the category right now. Please try again.";

type UseCreateCategoryOptions = {
    onSuccess?: () => void;
    onError?: (error: unknown) => void;
};

export default function useCreateCategory(options?: UseCreateCategoryOptions) {

    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [technicalDetails, setTechnicalDetails] = useState("");

    const createCategory = async (categoryDto: Omit<Category, "id">) => {
        try {
            setIsLoading(true);
            setErrorMsg("");
            setTechnicalDetails("");

            await apiCreateCategory(categoryDto);
            options?.onSuccess?.();

        } catch (error) {
            console.error("Failed to create category:", error);
            setErrorMsg(FRIENDLY_ERROR_MSG);
            setTechnicalDetails(extractTechnicalDetails(error));
            options?.onError?.(error);

        } finally {
            setIsLoading(false);
        }
    };

    return {
        createCategory,
        isLoading,
        errorMsg,
        technicalDetails,
    };
}