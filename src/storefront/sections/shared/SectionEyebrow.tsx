import {cn} from '@/shared/utils/cn'

/**
 * Colour context for the eyebrow.
 *
 * The rule, in one line: **the text matches its heading, the rule is the accent.**
 * That is what makes an eyebrow read as part of the heading block rather than as
 * a stray coloured label, and it holds on every surface.
 *
 * - `default` — a light page surface. Text is --sf-text, same as SectionHeading's
 *   title. Inside a `Section variant="dark"` the text is lifted to the heading's
 *   own white by a rule in index.css (see below); the accent rule needs no
 *   override because a <span> is not matched by that stylesheet's `p` selector.
 * - `onDark` — over a photo or dark chrome that is NOT a `data-variant` band, so
 *   no stylesheet rule applies: the text states the light colour itself.
 * - `onAccent` — on the accent colour itself, where an accent rule would vanish,
 *   so both parts use accent-text.
 *
 * ⚠️ The dark-band text colour deliberately lives in `index.css`, keyed on the
 * `data-eyebrow` attribute this component sets. It cannot be a utility class:
 * `[data-variant="dark"] p` there has specificity (0,1,1), and Tailwind's
 * `in-data-[variant=dark]:` variant compiles to `:where(…)`, which contributes
 * zero — so a class override is (0,1,0) and loses silently. Verified against the
 * built CSS after a first attempt that looked correct and did nothing.
 */
export type EyebrowTone = 'default' | 'onDark' | 'onAccent'

const TEXT_TONE: Record<EyebrowTone, string> = {
    default: 'text-(--sf-text)',
    onDark: 'text-(--sf-accent-text)',
    onAccent: 'text-(--sf-accent-text)',
}

const RULE_TONE: Record<EyebrowTone, string> = {
    default: 'bg-(--sf-accent)',
    onDark: 'bg-(--sf-accent)',
    onAccent: 'bg-(--sf-accent-text)',
}

const ALIGN_CLASS = {
    left: '',
    center: 'justify-center',
    right: 'justify-end',
} as const

interface SectionEyebrowProps {
    children: string
    tone?: EyebrowTone
    /**
     * Horizontal placement. The rule leads the text, so the pair is a flex row —
     * `text-center` on an ancestor does nothing to it and the alignment has to
     * be stated here.
     */
    align?: 'left' | 'center' | 'right'
    /** Layout-only adjustments from the consumer (e.g. a different margin). */
    className?: string
}

/**
 * The storefront's single eyebrow: a short accent rule followed by a small
 * uppercase label. Every surface that shows one renders THIS — section headings,
 * the hero kicker and the CTA band — so the treatment cannot drift between them.
 */
export function SectionEyebrow({children, tone = 'default', align = 'left', className}: SectionEyebrowProps) {
    return (
        <p
            data-eyebrow
            className={cn(
                'mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest',
                TEXT_TONE[tone],
                ALIGN_CLASS[align],
                className,
            )}
        >
            <span className={cn('inline-block h-0.5 w-4 shrink-0', RULE_TONE[tone])} aria-hidden="true"/>
            {children}
        </p>
    )
}
