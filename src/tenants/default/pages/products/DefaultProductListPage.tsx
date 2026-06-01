import React from 'react';
import {CataloguePageLayout, ProductList as CatalogProductList, useProducts} from '@/features/catalog';
import {env} from '@/lib/env';

interface ProductListProps {
    activeCategory: string;
}

const DefaultProductListPage: React.FC<ProductListProps> = ({activeCategory}) => {
    const {products, loading, error} = useProducts({
        categoryId: activeCategory,
        pageIndex: 0,
        pageSize: 50,
        sortBy: 'name',
    });

    return (
        <CataloguePageLayout
            maxWidth="max-w-6xl"
            grid={
                <div>
                    <h1 className="mb-6 text-2xl font-bold">
                        Products ({env.storefrontTenant ?? 'all'})
                    </h1>
                    {loading && <div>Loading…</div>}
                    {error && <div className="text-(--sf-error)">{error}</div>}
                    {/* ProductList renders its own cart controls via showCart prop */}
                    <CatalogProductList products={products} showCart/>
                </div>
            }
        />
    );
};

export default DefaultProductListPage;
