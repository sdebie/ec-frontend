import {ChevronRight} from 'lucide-react';

import {cn} from '@/utils/cn.ts';

import type {UvhCatalogueQuickCategory} from '@/tenants/uvh/pages/products/catalogue.config.ts';

type UvhCatalogueCategoryBarProps = {
    categories: UvhCatalogueQuickCategory[];
    activeId: string;
    onSelect: (id: string) => void;
};

export function UvhCatalogueCategoryBar({categories, activeId, onSelect}: UvhCatalogueCategoryBarProps) {
    return (
        <div className="border-b border-(--sf-border) bg-(--sf-panel)">
            <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-4 py-3 sm:px-6 lg:px-8 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {categories.map((item) => {
                    const Icon = item.icon;
                    const isActive = item.id === activeId;
                    return (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => onSelect(item.id)}
                            className={cn(
                                'inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold transition sm:px-4 sm:text-sm',
                                isActive
                                    ? 'border-(--sf-accent) bg-(--sf-accent) text-(--sf-accent-text)'
                                    : 'border-(--sf-border) bg-white text-(--sf-text) hover:border-(--sf-accent) hover:text-(--sf-accent)',
                            )}
                        >
                            <Icon className="size-4 shrink-0" aria-hidden />
                            {item.label}
                        </button>
                    );
                })}
                <button
                    type="button"
                    onClick={() => onSelect('all')}
                    className="ml-1 inline-flex shrink-0 items-center gap-1 whitespace-nowrap px-2 py-2 text-xs font-semibold text-(--sf-accent) hover:underline sm:text-sm"
                >
                    View all categories
                    <ChevronRight className="size-4" aria-hidden />
                </button>
            </div>
        </div>
    );
}
