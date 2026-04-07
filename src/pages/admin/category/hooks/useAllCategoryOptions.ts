import {useEffect, useState} from "react";
import {Category} from "@/types/admin/CategoryTypes.ts";
import {apiGetAllCategories} from "@/services/graphql/admin/category/CategoryService.graphql.ts";
import {SearchableSelectOption} from "@/components/shared/select/SearchableSelect.tsx";

export default function useAllCategoryOptions() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [options, setOptions] = useState<SearchableSelectOption[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        let isActive = true;

        const fetchAll = async () => {
            setIsLoading(true);
            try {
                const result = await apiGetAllCategories(
                    {pageIndex: 0, pageSize: 1000},
                    {
                        filters: [],
                        filterGroups: [],
                        sort: [{field: "name", direction: "ASC"}],
                    }
                );
                if (!isActive) return;
                setCategories(result);
                setOptions(result.map((c) => ({value: c.id, label: c.name})));
            } catch (err) {
                console.error("Failed to fetch categories for dropdown:", err);
            } finally {
                if (isActive) setIsLoading(false);
            }
        };

        void fetchAll();

        return () => {
            isActive = false;
        };
    }, []);

    return {categories, options, isLoading};
}

