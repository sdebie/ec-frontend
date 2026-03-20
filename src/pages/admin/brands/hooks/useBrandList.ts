import {useEffect, useMemo, useState} from "react";
import {apiGetAllBrands} from "@/services/graphql/admin/brand/brand.service.ts";
import {Brand} from "@/services/graphql/admin/brand/brand.types.ts";
import {FilterRequest, PageRequest} from "@/types/graphql/query.types.ts";

export default function useBrandList() {

    const [brandList, setBrandList] = useState<Brand[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");

    const pageRequest = useMemo<PageRequest>(
        () => ({
            pageIndex: 0,
            pageSize: 200,
        }),
        []
    );

    const filterRequest = useMemo<FilterRequest>(
        () => ({
            filters: [],
            filterGroups: [],
            sort: [{field: "name", direction: "ASC"}],
        }),
        []
    );

    useEffect(() => {
        let isActive = true;

        const fetchBrands = async () => {
            try {
                setIsLoading(true);
                setErrorMsg("");

                const data = await apiGetAllBrands(pageRequest, filterRequest);

                if (isActive) {
                    setBrandList(data);
                }
            } catch (error) {
                console.error("Failed to fetch brands:", error);

                if (isActive) {
                    setErrorMsg("Failed to load brands.");
                }
            } finally {
                if (isActive) {
                    setIsLoading(false);
                }
            }
        };

        void fetchBrands();

        return () => {
            isActive = false;
        };
    }, [pageRequest, filterRequest]);

    return {
        brands: brandList,
        isLoading,
        errorMsg,
    };
}
