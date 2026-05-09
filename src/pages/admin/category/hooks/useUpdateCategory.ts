import {useState} from "react";

import {apiUpdateCategory} from "@/services/graphql/admin/category/CategoryService.graphql.ts";
import {Category} from "@/types/admin/CategoryTypes.ts";
import {extractTechnicalDetails} from "@/utils/graphqlErrorUtils.ts";

const FRIENDLY_ERROR_MSG = "We couldn't save your changes right now. Please try again.";

type UseUpdateCategoryOptions = {
    onSuccess?: () => void;
    onError?: (error: unknown) => void;
};

export default function useUpdateCategory(options?: UseUpdateCategoryOptions) {

    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [technicalDetails, setTechnicalDetails] = useState("");

    const updateCategory = async (category: Category) => {

        const {id, ...categoryDto} = category;

        if (!id) {
            setErrorMsg("Category id is required to update.");
            setTechnicalDetails("");
            return;
        }

        try {
            setIsLoading(true);
            setErrorMsg("");
            setTechnicalDetails("");

            await apiUpdateCategory(id, categoryDto);
            options?.onSuccess?.();

        } catch (error) {
            console.error("Failed to update category:", error);
            setErrorMsg(FRIENDLY_ERROR_MSG);
            setTechnicalDetails(extractTechnicalDetails(error));
            options?.onError?.(error);

        } finally {
            setIsLoading(false);
        }
    };

    return {
        updateCategory,
        isLoading,
        errorMsg,
        technicalDetails,
    };
}