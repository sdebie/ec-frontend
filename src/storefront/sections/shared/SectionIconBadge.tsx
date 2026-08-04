import type {ComponentType, SVGProps} from 'react'

import {cn} from '@/shared/utils/cn'

interface SectionIconBadgeProps {
    /** Resolved registry icon — callers pass the component, never a name. */
    icon: ComponentType<SVGProps<SVGSVGElement>>
    /**
     * 'soft' (default): a faint accent wash carrying the icon in the accent
     * itself — the quiet treatment for a tile among many tiles.
     * 'solid': a muted accent tile carrying the icon in accent-text, for a
     * section that wants its icons to read as a deliberate accent block.
     *
     * Both tones are pure token arithmetic on --sf-accent, so every client gets
     * its own brand colour with no per-client code. `solid` is safe for any
     * accent because --sf-accent-text is by definition the readable foreground
     * for --sf-accent, and mixing at 85% barely moves the pair apart: UVH's
     * #7a0019 keeps ~13:1 with white on the dark band and ~8:1 on the light one.
     */
    tone?: 'soft' | 'solid'
    /** Layout-only adjustments from the consumer — never colours. */
    className?: string
}

// Complete literal class strings — Tailwind scans source text, so an
// interpolated tone reference would emit no CSS.
const TILE_TONE: Record<'soft' | 'solid', string> = {
    soft: 'bg-[color-mix(in_srgb,var(--sf-accent)_10%,transparent)]',
    solid: 'bg-[color-mix(in_srgb,var(--sf-accent)_85%,transparent)]',
}
const ICON_TONE: Record<'soft' | 'solid', string> = {
    soft: 'text-(--sf-accent)',
    solid: 'text-(--sf-accent-text)',
}

/**
 * The shared square icon tile used by section cards (benefits, promo-grid).
 * Fixed-size so a title wrapping to two lines stays aligned to the tile's top.
 */
export function SectionIconBadge({icon, tone = 'soft', className}: SectionIconBadgeProps) {
    // Direct binding (not a call) — the react-hooks/static-components rule
    // false-positives on function-call lookups of component references.
    const IconComponent = icon

    return (
        <span
            className={cn(
                'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                TILE_TONE[tone],
                className,
            )}
            aria-hidden="true"
        >
            <IconComponent className={cn('h-5 w-5', ICON_TONE[tone])}/>
        </span>
    )
}
