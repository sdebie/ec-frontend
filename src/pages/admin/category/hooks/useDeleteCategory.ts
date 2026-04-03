import {useState} from "react";
import {extractTechnicalDetails} from "@/utils/graphqlErrorUtils.ts";
import {apiDeleteCategory} from "@/services/graphql/admin/category/CategoryService.ts";

const FRIENDLY_ERROR_MSG = "We couldn't delete the category right now. Please try again.";

type UseDeleteCategoryOptions = {
    onSuccess?: () => void;
    onError?: (error: unknown) => void;
};

export default function useDeleteCategory(options?: UseDeleteCategoryOptions) {

    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [technicalDetails, setTechnicalDetails] = useState("");

    const deleteCategory = async (categoryId: string) => {
        try {
            setIsLoading(true);
            setErrorMsg("");
            setTechnicalDetails("");

            await apiDeleteCategory(categoryId);
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
        deleteCategory,
        isLoading,
        errorMsg,
        technicalDetails,
    };
}