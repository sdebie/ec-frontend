import {useEffect, useState} from "react";
import {apiGetBrand} from "@/services/graphql/admin/brand/BrandService.graphql.ts";
import {Brand} from "@/types/admin/BrandTypes.ts";
import {extractTechnicalDetails} from "@/utils/graphqlErrorUtils.ts";

const FRIENDLY_ERROR_MSG = "We couldn't load the brand. Please try again.";

export default function useGetBrand(id?: string, enabled = true) {
    const [brand, setBrand] = useState<Brand | null>(null);
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
                const data = await apiGetBrand(id);
                if (isActive) setBrand(data);
            } catch (error) {
                console.error("Failed to fetch brand:", error);
                if (isActive) {
                    setErrorMsg(FRIENDLY_ERROR_MSG);
                    setTechnicalDetails(extractTechnicalDetails(error));
                }
            } finally {
                if (isActive) setIsLoading(false);
            }
        };

        void fetchBrand();

        return () => { isActive = false; };
    }, [id, enabled]);

    return {brand, isLoading, errorMsg, technicalDetails};
}
