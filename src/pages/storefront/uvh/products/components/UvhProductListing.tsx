import {useMemo, useState} from "react";
import {Category} from "@/types/admin/CategoryTypes.ts";
import {ProductShoppingListItem} from "@/types/admin/ProductTypes.ts";
import {ProductCard} from "@/components/shared/card/default/ProductCard.tsx";
import { SfCard, SfInput } from '@/components/storefront';

type UvhCatalogueProduct = ProductShoppingListItem & {
    category?: {
        id: string;
        name: string;
        slug?: string;
    } | null;
};

interface UvhProductListingProps {
    selectedSubcategory: Category | null;
    products: UvhCatalogueProduct[];
}

const UvhProductListing = ({
                               selectedSubcategory,
                               products,
                           }: UvhProductListingProps) => {
    const [search, setSearch] = useState('');

    const filteredProducts = useMemo(() => {
        return products.filter((product) => {
            const matchesSubcategory = selectedSubcategory
                ? product.category?.id === selectedSubcategory.id
                : true;

            const matchesSearch = product.name
                .toLowerCase()
                .includes(search.toLowerCase());

            return matchesSubcategory && matchesSearch;
        });
    }, [products, search, selectedSubcategory]);

    const listingLabel = selectedSubcategory
        ? 'SHOP SUBCATEGORY'
        : 'SHOP PRODUCTS';

    const listingTitle = selectedSubcategory
        ? selectedSubcategory.name
        : 'All Products';

    return (
        <div className="min-h-screen bg-(--sf-bg)">
            <div className="border-b border-(--sf-border) bg-(--sf-panel) px-4 py-5 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-(--sf-accent)">
                                {listingLabel}
                            </p>
                            <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl text-(--sf-text)">
                                {listingTitle}
                            </h1>
                        </div>

                        <p className="text-sm text-(--sf-muted-text)">
                            {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
                    <SfCard as="aside" className="w-full shrink-0 p-5 lg:w-60 xl:w-64">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-(--sf-accent)">
                            Filter
                        </p>

                        <SfInput
                            type="search"
                            placeholder="Search products…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="px-3 py-2 text-sm focus:ring-0 focus-visible:ring-2 focus-visible:ring-(--sf-accent)"
                        />

                        <div className="mt-5 text-xs text-(--sf-muted-text)">
                            {selectedSubcategory
                                ? `Showing products in ${selectedSubcategory.name}.`
                                : 'Showing all products.'}
                        </div>
                    </SfCard>

                    <div className="min-w-0 flex-1">
                        {filteredProducts.length === 0 ? (
                            <SfCard className="flex h-48 items-center justify-center text-(--sf-muted-text)">
                                <p className="text-sm">No products found.</p>
                            </SfCard>
                        ) : (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                                {filteredProducts.map((product) => {
                                    const featuredImage =
                                        product.images?.find((img) => img.isFeatured) ??
                                        product.images?.[0];

                                    const retailPrice = product.retailPrice?.price ?? 0;
                                    const salePrice = product.retailSalePrice?.price ?? undefined;

                                    return (
                                        <ProductCard
                                            key={product.id}
                                            id={product.id}
                                            name={product.name}
                                            price={salePrice ?? retailPrice}
                                            originalPrice={salePrice ? retailPrice : undefined}
                                            image={featuredImage?.imageUrl}
                                        />
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UvhProductListing;