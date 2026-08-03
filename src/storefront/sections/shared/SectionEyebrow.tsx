import {cn} from '@/shared/utils/cn'

/**
 * Colour context for the eyebrow.
 *
 * The rule, in one line: **the RULE is always the accent; the TEXT takes the
 * accent on light surfaces and the heading's own colour on dark ones** (owner
 * directive 2026-08-03). The accent mark is therefore constant everywhere — it
 * is the brand signature — while the label never fights its own heading.
 *
 * Dark surfaces read the heading colour rather than the accent because this
 * client's #7a0019 measures ~1.6:1 on the #121212 base and ~1.4:1 over the
 * scrimmed hero photo: legible in theory, unappealing and near-invisible in
 * practice.
 *
 * - `default` — light page surface: text is the accent.
 * - `onDark` — a photo or dark chrome that is NOT a `data-variant` band, so no
 *   stylesheet rule reaches it: it states the heading's light colour itself.
 * - `onAccent` — the surface IS the accent, where an accent rule would vanish,
 *   so both parts use accent-text.
 *
 * ⚠️ The `data-variant="dark"` band's text colour lives in `index.css`, keyed on
 * the `data-eyebrow` attribute this component sets, NOT as a utility class here:
 * the stylesheet's `[data-variant="dark"] p` rule has specificity (0,1,1), and
 * Tailwind's `in-data-[variant=dark]:` variant compiles to `:where(…)`,
 * contributing zero — so a class override is (0,1,0) and loses silently.
 * Verified in the built CSS after a first attempt that looked correct in the
 * markup and did nothing.
 */
export type EyebrowTone = 'default' | 'onDark' | 'onAccent'

const TEXT_TONE: Record<EyebrowTone, string> = {
    default: 'text-(--sf-accent)',
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
