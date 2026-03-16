import {useCallback, useEffect, useState} from "react";
import {getAllBrands} from "./brand.service";
import type {Brand, SearchRequest} from "./brand.types";
import {GraphQLRequestError, normalizeGraphQLError} from "../../errors";

type UseBrandsState = {
    data: Brand[];
    loading: boolean;
    error: GraphQLRequestError | null;
    refetch: () => Promise<void>;
};

export function useBrands(searchRequest?: SearchRequest): UseBrandsState {
    const [data, setData] = useState<Brand[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<GraphQLRequestError | null>(null);

    const run = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const brands = await getAllBrands(searchRequest);
            setData(brands);
        } catch (requestError) {
            setError(normalizeGraphQLError(requestError));
        } finally {
            setLoading(false);
        }
    }, [searchRequest]);

    useEffect(() => {
        void run();
    }, [run]);

    return {
        data,
        loading,
        error,
        refetch: run,
    };
}

