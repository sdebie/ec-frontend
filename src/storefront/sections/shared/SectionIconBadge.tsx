import type {ComponentType, SVGProps} from 'react'

import {cn} from '@/shared/utils/cn'

interface SectionIconBadgeProps {
    /** Resolved registry icon — callers pass the component, never a name. */
    icon: ComponentType<SVGProps<SVGSVGElement>>
    /**
     * A strength scale, quietest first.
     *
     * 'soft' (default): a faint accent wash carrying the icon in the accent
     * itself — the quiet treatment for a tile among many tiles, on a LIGHT band.
     * 'muted': the same quiet weight for a DARK band. `soft` cannot be used
     * there — an accent icon on an accent wash over near-black vanishes — so the
     * tile carries a little more accent and the icon flips to accent-text, tuned
     * to recede into a dark band by about as much as `soft` recedes into a light
     * one, so the two read as the same treatment across surfaces.
     * 'solid': a strong accent tile, for a section that wants its icons to read
     * as a deliberate accent block rather than a quiet marker.
     *
     * Every tone is pure token arithmetic on --sf-accent, so each client gets its
     * own brand colour with no per-client code, and the accent-text tones are
     * safe for any accent because --sf-accent-text is by definition the readable
     * foreground for --sf-accent.
     */
    tone?: 'soft' | 'muted' | 'solid'
    /** Layout-only adjustments from the consumer — never colours. */
    className?: string
}

// Complete literal class strings — Tailwind scans source text, so an
// interpolated tone reference would emit no CSS.
const TILE_TONE: Record<'soft' | 'muted' | 'solid', string> = {
    soft: 'bg-[color-mix(in_srgb,var(--sf-accent)_10%,transparent)]',
    muted: 'bg-[color-mix(in_srgb,var(--sf-accent)_55%,transparent)]',
    solid: 'bg-[color-mix(in_srgb,var(--sf-accent)_85%,transparent)]',
}
const ICON_TONE: Record<'soft' | 'muted' | 'solid', string> = {
    soft: 'text-(--sf-accent)',
    muted: 'text-(--sf-accent-text)',
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
