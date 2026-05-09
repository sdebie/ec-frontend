import {useEffect, useState} from "react";

import {apiGetCategory} from "@/services/graphql/admin/category/CategoryService.graphql.ts";
import {Category} from "@/types/admin/CategoryTypes.ts";
import {extractTechnicalDetails} from "@/utils/graphqlErrorUtils.ts";

const FRIENDLY_ERROR_MSG = "We couldn't load the category. Please try again.";

export default function useGetCategory(id?: string, enabled = true) {

    const [category, setCategory] = useState<Category | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [technicalDetails, setTechnicalDetails] = useState("");

    useEffect(() => {
        
        if (!id || !enabled) return;

        let isActive = true;

        const fetchBrand = async () => {
            try {
                setIsLoading(true);
                setErrorMsg("");
                setTechnicalDetails("");

                const data = await apiGetCategory(id);

                if (isActive) setCategory(data);

            } catch (error) {
                console.error("Failed to fetch category", error);
                if (isActive) {
                    setErrorMsg(FRIENDLY_ERROR_MSG);
                    setTechnicalDetails(extractTechnicalDetails(error));
                }
            } finally {
                if (isActive) setIsLoading(false);
            }
        };

        void fetchBrand();

        return () => {
            isActive = false;
        };
    }, [id, enabled]);

    return {category, isLoading, errorMsg, technicalDetails};
}