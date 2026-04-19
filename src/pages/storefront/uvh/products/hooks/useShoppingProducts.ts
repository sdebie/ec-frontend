import {useCallback, useEffect, useState} from 'react';
import {ProductShoppingListItem} from '@/types/admin/ProductTypes.ts';
import {apiGetShoppingProductsList} from '@/services/graphql/product/product.service.ts';

export type ShoppingProductsResponse = ProductShoppingListItem[];

export type UseShoppingProductsResult = {
    products: ProductShoppingListItem[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
};

export const useShoppingProducts = (): UseShoppingProductsResult => {
    const [products, setProducts] = useState<ProductShoppingListItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await apiGetShoppingProductsList();
            const data = response as ShoppingProductsResponse;

            setProducts(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load products.');
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        let isMounted = true;

        const run = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await apiGetShoppingProductsList();
                const data = response as ShoppingProductsResponse;

                if (isMounted) {
                    setProducts(Array.isArray(data) ? data : []);
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
    }, []);

    return {
        products,
        loading,
        error,
        refetch: fetchProducts,
    };
};