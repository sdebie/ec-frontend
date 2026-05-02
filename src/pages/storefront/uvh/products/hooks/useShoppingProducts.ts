import {useCallback, useEffect, useMemo, useState} from 'react';
import {fetchStorefrontCatalogueProducts} from '@/services/storefront/catalogue/catalogue.service.ts';
import type {ProductShoppingListItem} from '@/types/admin/ProductTypes.ts';

export type ShoppingProductsResponse = ProductShoppingListItem[];

export type UseShoppingProductsResult = {
    products: ProductShoppingListItem[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
};

export type ShoppingProductsQuery = {
    categoryId?: string | null;
    search?: string;
    sortBy?: 'name' | 'price-asc' | 'price-desc';
    pageIndex?: number;
    pageSize?: number;
};

export const useShoppingProducts = (
    query: ShoppingProductsQuery = {},
): UseShoppingProductsResult => {
    const [products, setProducts] = useState<ProductShoppingListItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const pageRequest = useMemo(
        () => ({
            pageIndex: query.pageIndex ?? 0,
            pageSize: query.pageSize ?? 12,
        }),
        [query.pageIndex, query.pageSize],
    );

    const sortProductsOnClient = useCallback(
        (items: ProductShoppingListItem[]): ProductShoppingListItem[] => {
            if (query.sortBy === 'name') {
                return [...items].sort((a, b) => a.name.localeCompare(b.name));
            }
            if (query.sortBy === 'price-asc') {
                return [...items].sort(
                    (a, b) => (a.retailPrice?.price ?? 0) - (b.retailPrice?.price ?? 0),
                );
            }
            if (query.sortBy === 'price-desc') {
                return [...items].sort(
                    (a, b) => (b.retailPrice?.price ?? 0) - (a.retailPrice?.price ?? 0),
                );
            }
            return items;
        },
        [query.sortBy],
    );

    const applyClientFilters = useCallback(
        (items: ProductShoppingListItem[]): ProductShoppingListItem[] => {
            const searchTerm = query.search?.trim().toLowerCase();
            if (!searchTerm) return items;

            return items.filter((item) => {
                const name = item.name?.toLowerCase() ?? '';
                const shortDescription = item.shortDescription?.toLowerCase() ?? '';
                return name.includes(searchTerm) || shortDescription.includes(searchTerm);
            });
        },
        [query.search],
    );

    const paginateProducts = useCallback(
        (items: ProductShoppingListItem[]): ProductShoppingListItem[] => {
            const start = pageRequest.pageIndex * pageRequest.pageSize;
            const end = start + pageRequest.pageSize;
            return items.slice(start, end);
        },
        [pageRequest.pageIndex, pageRequest.pageSize],
    );

    const transformProducts = useCallback(
        (items: ProductShoppingListItem[]): ProductShoppingListItem[] => {
            const searched = applyClientFilters(items);
            const sorted = sortProductsOnClient(searched);
            return paginateProducts(sorted);
        },
        [applyClientFilters, paginateProducts, sortProductsOnClient],
    );

    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Backend currently throws SemanticException for filterRequest on this endpoint.
            // Keep API call compatible by only sending categoryId and applying search/sort/page client-side.
            const response = await fetchStorefrontCatalogueProducts(
                query.categoryId ?? null,
                undefined,
                undefined,
            );
            const data = response as ShoppingProductsResponse;
            setProducts(Array.isArray(data) ? transformProducts(data) : []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load products.');
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }, [query.categoryId, transformProducts]);

    useEffect(() => {
        let isMounted = true;

        const run = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetchStorefrontCatalogueProducts(
                    query.categoryId ?? null,
                    undefined,
                    undefined,
                );
                const data = response as ShoppingProductsResponse;

                if (isMounted) {
                    setProducts(Array.isArray(data) ? transformProducts(data) : []);
                }
            } catch (err) {
                if (isMounted) {
                    setError(err instanceof Error ? err.message : 'Failed to load products.');
                    setProducts([]);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        run();

        return () => {
            isMounted = false;
        };
    }, [query.categoryId, transformProducts]);

    return {
        products,
        loading,
        error,
        refetch: fetchProducts,
    };
};