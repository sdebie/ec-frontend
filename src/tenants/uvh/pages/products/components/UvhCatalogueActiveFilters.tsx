import {X} from 'lucide-react';

type ActiveFilterChip = {
    id: string;
    label: string;
    onRemove: () => void;
};

type UvhCatalogueActiveFiltersProps = {
    chips: ActiveFilterChip[];
    onClearAll: () => void;
};

export function UvhCatalogueActiveFilters({chips, onClearAll}: UvhCatalogueActiveFiltersProps) {
    if (chips.length === 0) return null;

    return (
        <div className="flex flex-wrap items-center gap-2">
            {chips.map((chip) => (
                <button
                    key={chip.id}
                    type="button"
                    onClick={chip.onRemove}
                    className="inline-flex items-center gap-1.5 rounded-full border border-(--sf-border) bg-(--sf-panel) px-3 py-1 text-xs font-medium text-(--sf-text) transition hover:border-(--sf-accent)"
                >
                    {chip.label}
                    <X className="size-3.5 text-(--sf-muted-text)" aria-hidden />
                    <span className="sr-only">Remove {chip.label}</span>
                </button>
            ))}
            <button
                type="button"
                onClick={onClearAll}
                className="text-xs font-semibold text-(--sf-accent) hover:underline"
            >
                Clear all
            </button>
        </div>
    );
}
