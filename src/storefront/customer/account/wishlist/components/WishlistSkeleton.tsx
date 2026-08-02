import type {ViewMode} from '@/storefront/catalog/hooks/useViewPreference'

/** Loading placeholder that mirrors the persisted view, so the layout does not
 *  jump when the real items arrive. */
export function WishlistSkeleton({view}: { view: ViewMode }) {

    if (view === 'list') {
        return (
            <div className="flex flex-col gap-3" data-layout="row">
                {/* Heights track the real row: taller below sm, where the price
                    and actions wrap to their own bar under the identity. */}
                {Array.from({length: 6})
                    .map((_, i) => (
                        <div key={i}
                             className="h-56 animate-pulse rounded-lg bg-(--sf-surface-muted) sm:h-44"/>
                    ))}
            </div>
        )
    }

    return (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4" data-layout="grid">
            {Array.from({length: 6})
                .map((_, i) => (
                    <div key={i} className="aspect-square animate-pulse rounded-lg bg-(--sf-surface-muted)"/>
                ))}
        </div>
    )
}
