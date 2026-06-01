import React from 'react';

import { useAddToCart } from '@/features/cart/hooks/useAddToCart.ts';
import { ProductList as CatalogProductList, useProducts } from '@/features/catalog';
import { getDisplayPrice } from '@/features/catalog/utils/pricing.ts';
import { env } from '@/lib/env';
import { useCustomerType } from '@/store/customerTypeStore.ts';

interface ProductListProps {
    activeCategory: string;
}

const DefaultProductListPage: React.FC<ProductListProps> = ({activeCategory}) => {
    const customerType = useCustomerType();
    const {createOrder} = useAddToCart();
    const { products, loading, error } = useProducts({
        categoryId: activeCategory,
        pageIndex: 0,
        pageSize: 50,
        sortBy: 'name',
    });

    const handleAddToCart = async (product: (typeof products)[number]) => {
        const unitPrice = getDisplayPrice(product, customerType).price;
        if (!product.variantId || unitPrice <= 0) return;
        await createOrder({
            items: [
                {
                    quantity: 1,
                    unitPrice,
                    variant: String(product.variantId),
                    productName: product.name,
                },
            ],
        });
    };

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-bold mb-6">Products ({env.storefrontTenant ?? 'all'})</h1>

            {loading && <div>Loading…</div>}
            {error && <div className="text-(--sf-error)">{error}</div>}

            <CatalogProductList products={products} onAddToCart={handleAddToCart} />
        </div>
    );
};

export default DefaultProductListPage;
