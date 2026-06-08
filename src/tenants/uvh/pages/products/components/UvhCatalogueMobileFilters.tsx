import {X} from 'lucide-react';
import {useEffect} from 'react';
import {Button} from '@/primitives/button';
import {UvhCatalogueSidebar} from '@/tenants/uvh/pages/products/components/UvhCatalogueSidebar.tsx';
import type {CatalogBrand, CatalogCategory} from '@/features/catalog/types.ts';

type UvhCatalogueMobileFiltersProps = {
    open: boolean;
    onClose: () => void;
    categories: CatalogCategory[];
    categoriesLoading: boolean;
    selectedCategoryId: string | null;
    onCategorySelect: (id: string | null) => void;
    categorySearch: string;
    onCategorySearchChange: (value: string) => void;
    brands: CatalogBrand[];
    brandsLoading: boolean;
    selectedBrandId: string | null;
    onBrandSelect: (id: string | null) => void;
    brandSearch: string;
    onBrandSearchChange: (value: string) => void;
};

export function UvhCatalogueMobileFilters({
                                              open,
                                              onClose,
                                              ...sidebarProps
                                          }: UvhCatalogueMobileFiltersProps) {
    useEffect(() => {
        if (!open) return;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', onKeyDown);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.body.style.overflow = '';
        };
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Product filters">
            <button
                type="button"
                className="absolute inset-0 bg-black/40"
                aria-label="Close filters"
                onClick={onClose}
            />
            <div className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-(--sf-bg) shadow-xl">
                <div className="flex items-center justify-between border-b border-(--sf-border) px-4 py-3">
                    <h2 className="text-base font-bold text-(--sf-text)">Filters</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-2 text-(--sf-text) hover:bg-(--sf-panel)"
                        aria-label="Close filters panel"
                    >
                        <X className="size-5" aria-hidden/>
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                    <UvhCatalogueSidebar {...sidebarProps} />
                </div>
                <div className="border-t border-(--sf-border) p-4">
                    <Button type="button" fullWidth onClick={onClose}>
                        Show results
                    </Button>
                </div>
            </div>
        </div>
    );
}
