import {useCallback, useEffect, useRef} from 'react';
import {Category} from "@/types/admin/CategoryTypes.ts";
import useStorefrontParentCategories from "@/pages/storefront/uvh/products/hooks/useStorefrontParentCategories.ts";

interface UvhCategoryMenuProps {
    selectedSubcategoryId?: string | null;
    onSubcategorySelect: (subcategory: Category | null) => void;
    activeRootCategory: Category | null;
    onRootCategoryChange: (category: Category | null) => void;
}

const UvhCategoryMenu = ({
                             selectedSubcategoryId = null,
                             onSubcategorySelect,
                             activeRootCategory,
                             onRootCategoryChange,
                         }: UvhCategoryMenuProps) => {
    const {categories} = useStorefrontParentCategories();

    const rootCategories = categories.filter((c) => c.parent === null);

    const subCategoryMap: Record<string, Category[]> = rootCategories.reduce<Record<string, Category[]>>(
        (acc, root) => {
            acc[root.id] = categories.filter((c) => c.parent?.id === root.id);
            return acc;
        },
        {}
    );

    const menuRef = useRef<HTMLDivElement>(null);

    const subCategories = activeRootCategory ? (subCategoryMap[activeRootCategory.id] ?? []) : [];
    const drawerOpen = activeRootCategory !== null;

    // Keyboard close — Escape
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') onRootCategoryChange(null);
    }, [onRootCategoryChange]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    const handleCategoryTabClick = (cat: Category) => {
        // Toggle: clicking the active tab closes the overlay
        onRootCategoryChange(activeRootCategory?.id === cat.id ? null : cat);
    };

    const handleSubcategoryClick = (subcategory: Category) => {
        const isSelected = selectedSubcategoryId === subcategory.id;
        onSubcategorySelect(isSelected ? null : subcategory);
        // Parent's handleSubcategorySelect already nulls out activeRootCategory
    };

    return (
        // relative so the absolute overlay panel is anchored to the bottom of this bar
        <div
            ref={menuRef}
            className="relative z-50 w-full border-b border-(--sf-border) bg-(--sf-bg) text-(--sf-text)"
        >
            {/* ── Tab bar (always visible) ── */}
            <nav
                aria-label="Product categories"
                className="flex snap-x snap-mandatory items-center gap-1 overflow-x-auto whitespace-nowrap px-3 sm:px-6 lg:px-8 scrollbar-hide [-webkit-overflow-scrolling:touch]"
            >
                <button
                    type="button"
                    onClick={() => {
                        onSubcategorySelect(null);
                        onRootCategoryChange(null);
                    }}
                    className={[
                        'relative snap-start shrink-0 whitespace-nowrap px-3 py-3 text-sm font-medium transition-colors duration-150 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-(--sf-accent) sm:px-4',
                        selectedSubcategoryId === null && !drawerOpen
                            ? 'text-(--sf-accent) after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:rounded-full after:bg-(--sf-accent)'
                            : 'text-(--sf-muted-text) hover:text-(--sf-accent)',
                    ].join(' ')}
                >
                    All Products
                </button>

                {rootCategories.map((cat) => {
                    const isActive = activeRootCategory?.id === cat.id;

                    return (
                        <button
                            key={cat.id}
                            type="button"
                            aria-expanded={isActive}
                            aria-controls={`drawer-${cat.id}`}
                            onClick={() => handleCategoryTabClick(cat)}
                            className={[
                                'relative snap-start shrink-0 whitespace-nowrap px-3 py-3 text-sm font-medium transition-colors duration-150 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-(--sf-accent) sm:px-4',
                                isActive
                                    ? 'text-(--sf-accent) after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:rounded-full after:bg-(--sf-accent)'
                                    : 'text-(--sf-muted-text) hover:text-(--sf-accent)',
                            ].join(' ')}
                        >
                            {cat.name}
                        </button>
                    );
                })}
            </nav>

            {/* ── Overlay panel (absolutely positioned — does NOT push listing down) ── */}
            {drawerOpen && activeRootCategory && (
                <div
                    id={`drawer-${activeRootCategory.id}`}
                    role="region"
                    aria-label={`${activeRootCategory.name} subcategories`}
                    className="absolute left-0 right-0 top-full z-50 border-t border-(--sf-border) shadow-xl"
                >
                    <div className="bg-(--sf-panel) text-(--sf-text)">
                        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6">
                            <div className="flex flex-col gap-5">
                                {/* Panel header */}
                                <div
                                    className="flex flex-col gap-3 border-b border-(--sf-border) pb-4 sm:flex-row sm:items-end sm:justify-between sm:pb-5">
                                    <div className="space-y-1">
                                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-(--sf-accent)">
                                            Shop category
                                        </p>
                                        <h3 className="text-lg font-semibold tracking-tight text-(--sf-text) sm:text-xl">
                                            {activeRootCategory.name}
                                        </h3>
                                        <p className="max-w-2xl text-sm text-(--sf-muted-text)">
                                            Explore subcategories and quickly narrow into the products you need.
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            onSubcategorySelect(null);
                                            onRootCategoryChange(null);
                                        }}
                                        className="inline-flex w-fit items-center justify-center self-end rounded-full bg-(--sf-accent) px-4 py-2.5 text-sm font-semibold text-(--sf-accent-text) transition-all duration-200 ease-in-out hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-(--sf-accent) sm:self-auto"
                                    >
                                        Browse all {activeRootCategory.name}
                                    </button>
                                </div>

                                {/* Subcategory grid */}
                                <div
                                    className="grid grid-cols-1 gap-3 pb-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                    {subCategories.map((sub) => {
                                        const isSelected = selectedSubcategoryId === sub.id;

                                        return (
                                            <button
                                                key={sub.id}
                                                type="button"
                                                onClick={() => handleSubcategoryClick(sub)}
                                                className={[
                                                    'group w-full rounded-2xl border px-4 py-4 text-left transition-all duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-(--sf-accent)',
                                                    isSelected
                                                        ? 'border-(--sf-accent) bg-(--sf-bg)'
                                                        : 'border-(--sf-border) bg-(--sf-panel) hover:border-(--sf-accent) hover:bg-(--sf-bg)',
                                                ].join(' ')}
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-semibold text-(--sf-text) transition-colors duration-200 ease-in-out group-hover:text-(--sf-accent)">
                                                            {sub.name}
                                                        </p>
                                                        <p className="mt-1 text-xs text-(--sf-muted-text)">
                                                            {sub.description || 'Explore products in this category'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UvhCategoryMenu;