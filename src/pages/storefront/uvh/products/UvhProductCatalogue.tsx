import {useState} from 'react';
import {Category} from '@/types/admin/CategoryTypes.ts';
import UvhCategoryMenu from '@/pages/storefront/uvh/products/components/UvhCategoryMenu.tsx';
import UvhProductListing from '@/pages/storefront/uvh/products/components/UvhProductListing.tsx';
import {useShoppingProducts} from "@/pages/storefront/uvh/products/hooks/useShoppingProducts.ts";
import { SfCard } from '@/components/storefront';

const UvhProductCatalogue = () => {

    const [selectedSubcategory, setSelectedSubcategory] = useState<Category | null>(null);
    const [activeRootCategory, setActiveRootCategory] = useState<Category | null>(null);
    const {products, loading, error} = useShoppingProducts();

    // Derived — no need for a separate boolean state
    const isCategoryMenuOpen = activeRootCategory !== null;

    const handleSubcategorySelect = (subcategory: Category | null) => {
        setSelectedSubcategory(subcategory);
        setActiveRootCategory(null); // always close the overlay after a selection
    };

    if (loading) {
        return (
            <div className="relative min-h-screen bg-(--sf-bg)">
                <UvhCategoryMenu
                    selectedSubcategoryId={selectedSubcategory?.id ?? null}
                    onSubcategorySelect={handleSubcategorySelect}
                    activeRootCategory={activeRootCategory}
                    onRootCategoryChange={setActiveRootCategory}
                />
                <div className="mx-auto max-w-7xl p-4">
                    <SfCard className="p-6 text-sm text-(--sf-muted-text)">Loading products...</SfCard>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="relative min-h-screen bg-(--sf-bg)">
                <UvhCategoryMenu
                    selectedSubcategoryId={selectedSubcategory?.id ?? null}
                    onSubcategorySelect={handleSubcategorySelect}
                    activeRootCategory={activeRootCategory}
                    onRootCategoryChange={setActiveRootCategory}
                />
                <div className="mx-auto max-w-7xl p-4">
                    <SfCard className="p-6 text-sm text-(--sf-error)">Error: {error}</SfCard>
                </div>
            </div>
        );
    }

    return (
        // relative so the absolute overlay panel is contained within this stacking context
        <div className="relative min-h-screen bg-(--sf-bg)">
            <UvhCategoryMenu
                selectedSubcategoryId={selectedSubcategory?.id ?? null}
                onSubcategorySelect={handleSubcategorySelect}
                activeRootCategory={activeRootCategory}
                onRootCategoryChange={setActiveRootCategory}
            />

            {/* Backdrop — closes overlay when user clicks outside the menu */}
            {isCategoryMenuOpen && (
                <div
                    className="fixed inset-0 z-40"
                    aria-hidden="true"
                    onClick={() => setActiveRootCategory(null)}
                />
            )}

            <UvhProductListing
                selectedSubcategory={selectedSubcategory}
                products={products}
            />
        </div>
    );
};

export default UvhProductCatalogue;