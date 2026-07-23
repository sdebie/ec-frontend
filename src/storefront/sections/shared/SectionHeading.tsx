import {cn} from '@/shared/utils/cn'

interface SectionHeadingProps {
    eyebrow?: string
    title: string
    subtitle?: string
    /** Layout-only adjustments from the consumer (e.g. `lg:mb-0` in a split row) — never colors. */
    className?: string
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
export function SectionHeading({eyebrow, title, subtitle, className}: SectionHeadingProps) {
    return (
        <div className={cn('mb-8', className)}>
            {eyebrow && (
                <p className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-(--sf-accent)">
                    <span className="inline-block h-0.5 w-4 bg-(--sf-accent)" aria-hidden="true"/>
                    {eyebrow}
                </p>
            )}

            <h2 className="text-3xl font-bold text-(--sf-text) in-data-[variant=dark]:text-inherit">
                {title}
            </h2>

            <span className="mt-2 block h-1 w-12 rounded-full bg-(--sf-accent)" aria-hidden="true"/>

            {subtitle && (
                <p className="mt-3 text-(--sf-muted-text) in-data-[variant=dark]:text-white/70">
                    {subtitle}
                </p>
            )}
        </div>
    )
}
