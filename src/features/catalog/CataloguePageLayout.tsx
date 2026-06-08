import type {ReactNode} from 'react';
import {cn} from '@/utils/cn.ts';

interface CataloguePageLayoutProps {
    /**
     * Optional hero / banner section rendered above the content area.
     * UVH uses a branded hero; the default tenant omits it.
     */
    hero?: ReactNode;
    /**
     * Optional filter sidebar. When provided the content area switches to a
     * two-column layout (sidebar | content) on large screens.
     * The sidebar is hidden on mobile; use `mobileFiltersDrawer` for that.
     */
    sidebar?: ReactNode;
    /** Search/sort bar rendered above the product grid. */
    toolbar?: ReactNode;
    /** Active-filter chips rendered between the toolbar and the grid. */
    activeFilters?: ReactNode;
    /**
     * Product grid — the only required slot. Receives loading/error states
     * from the caller so the grid can render its own skeletons/messages.
     */
    grid: ReactNode;
    /** Portal-rendered drawer for mobile filter access. */
    mobileFiltersDrawer?: ReactNode;
    /** Tailwind max-width class applied to the inner section. Defaults to max-w-7xl. */
    maxWidth?: string;
}

/**
 * CataloguePageLayout — structural shell shared by all tenant product catalogue pages.
 *
 * Provides the page wrapper, optional two-column sidebar+content layout, and
 * named slots for hero, toolbar, filter chips, grid, and mobile drawer.
 * All visual styling (colours, spacing, typography) is left to the slot contents.
 *
 * Tenant pages pass their own components into each slot; the layout only
 * governs structure and responsive breakpoints.
 */
export function CataloguePageLayout({
                                        hero,
                                        sidebar,
                                        toolbar,
                                        activeFilters,
                                        grid,
                                        mobileFiltersDrawer,
                                        maxWidth = 'max-w-7xl',
                                    }: CataloguePageLayoutProps) {
    return (
        <main className="min-h-screen w-full bg-(--sf-bg)">
            {hero}

            <section className={cn('mx-auto px-4 py-6 sm:px-6 lg:px-8', maxWidth)}>
                <div
                    className={cn(
                        'flex flex-col gap-6',
                        sidebar && 'lg:flex-row lg:items-start',
                    )}
                >
                    {sidebar && (
                        <div className="hidden w-full shrink-0 lg:block lg:w-64 xl:w-72">
                            {sidebar}
                        </div>
                    )}

                    <div className="min-w-0 flex-1 space-y-4">
                        {toolbar}
                        {activeFilters}
                        {grid}
                    </div>
                </div>
            </section>

            {mobileFiltersDrawer}
        </main>
    );
}
