import type {LucideIcon} from 'lucide-react'

interface OrderStatTileProps {
    label: string
    value: string
    icon: LucideIcon
}

/**
 * One headline figure. Neutral surface rather than the design's pastel blocks: those
 * colours carry no meaning here, and on the admin surface a colour that means nothing
 * competes with the status badges, which mean a great deal.
 */
export function OrderStatTile({label, value, icon: Icon}: OrderStatTileProps) {
    return (
        <div className="flex items-center gap-3 rounded-lg border border-(--c-border) bg-(--c-panel-secondary) p-4">
            {/* Decorative: the label already names the figure, so the icon must not be read out. */}
            <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-(--c-accent-subtle) text-(--c-accent)">
                <Icon className="h-4 w-4" aria-hidden="true"/>
            </span>
            <div className="min-w-0">
                <p className="text-xs font-medium text-(--c-text-muted)">
                    {label}
                </p>
                <p className="mt-0.5 text-base font-semibold text-(--c-text)">
                    {value}
                </p>
            </div>
        </div>
    )
}
