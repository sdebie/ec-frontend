import {cn} from '@/shared/utils/cn'
import {sectionIconMap} from './sectionIcons'

interface SectionHeadingProps {
    eyebrow?: string
    title: string
    subtitle?: string
    /** Named icon from the shared section registry, rendered beside the title. */
    icon?: string
    /**
     * Heading level. Defaults to `h2` (a section inside a page). Pages that use
     * this as their page title pass `h1` so the document keeps exactly one —
     * visual treatment is identical either way.
     */
    as?: 'h1' | 'h2'
    /**
     * Colour context, matching `Carousel`'s prop of the same name. 'default'
     * reads against the page surface (or a `Section` dark band, via the
     * data-variant scope below). 'onAccent' is for a heading sitting on a
     * client-authored colour band — a category showcase's gradient — where
     * --sf-accent itself disappears into the background; it uses the
     * accent-text token for both the title and the rule.
     */
    tone?: 'default' | 'onAccent'
    /** Layout-only adjustments from the consumer (e.g. `lg:mb-0` in a split row) — never colors. */
    className?: string
}

// Complete literal class strings per tone — Tailwind scans source text, so an
// interpolated token reference emits no CSS.
const EYEBROW_TONE: Record<'default' | 'onAccent', string> = {
    default: 'text-(--sf-accent)',
    onAccent: 'text-(--sf-accent-text)',
}
const EYEBROW_DASH_TONE: Record<'default' | 'onAccent', string> = {
    default: 'bg-(--sf-accent)',
    onAccent: 'bg-(--sf-accent-text)',
}
const TITLE_TONE: Record<'default' | 'onAccent', string> = {
    default: 'text-(--sf-text) in-data-[variant=dark]:text-inherit',
    onAccent: 'text-(--sf-accent-text) drop-shadow-md',
}
const ICON_TONE: Record<'default' | 'onAccent', string> = {
    default: 'text-(--sf-accent)',
    onAccent: 'text-(--sf-accent-text)',
}
const RULE_TONE: Record<'default' | 'onAccent', string> = {
    default: 'bg-(--sf-accent)',
    onAccent: 'bg-(--sf-accent-text)',
}
const SUBTITLE_TONE: Record<'default' | 'onAccent', string> = {
    default: 'text-(--sf-muted-text) in-data-[variant=dark]:text-white/70',
    onAccent: 'text-(--sf-accent-text)/80',
}

/**
 * Shared section heading: optional eyebrow (small caps + accent dash),
 * required <h2> title, optional subtitle, and a short accent underline rule.
 *
 * Colours use --sf-* tokens only. Dark-variant treatment is inherited from
 * the enclosing Section's [data-variant="dark"] scope — this component
 * does NOT accept a variant prop. Title and subtitle use `inherit` for colour
 * so they pick up the dark text colour set by Section's inline style; in light
 * mode, explicit --sf-text/--sf-muted-text tokens apply.
 */
export function SectionHeading({eyebrow, title, subtitle, icon, as = 'h2', tone = 'default', className}: SectionHeadingProps) {
    const Heading = as
    // Direct map access (not a call) — the react-hooks/static-components rule
    // false-positives on function-call lookups of component references.
    const IconComponent = icon ? sectionIconMap[icon] : undefined
    if (icon && !IconComponent && import.meta.env.DEV) {
        console.warn(
            `[SectionHeading] Unknown icon name: "${icon}". Registered names: ${Object.keys(sectionIconMap).join(', ')}`
        )
    }

    return (
        <div className={cn('mb-8', className)}>
            {eyebrow && (
                <p className={cn('mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest', EYEBROW_TONE[tone])}>
                    <span className={cn('inline-block h-0.5 w-4', EYEBROW_DASH_TONE[tone])} aria-hidden="true"/>
                    {eyebrow}
                </p>
            )}

            <Heading className={cn('flex items-center gap-3 text-3xl font-bold', TITLE_TONE[tone])}>
                {IconComponent && (
                    <IconComponent className={cn('h-7 w-7 shrink-0', ICON_TONE[tone])} aria-hidden="true"/>
                )}
                {title}
            </Heading>

            <span className={cn('mt-2 block h-1 w-12 rounded-full', RULE_TONE[tone])} aria-hidden="true"/>

            {subtitle && (
                <p className={cn('mt-3', SUBTITLE_TONE[tone])}>
                    {subtitle}
                </p>
            )}
        </div>
    )
}
