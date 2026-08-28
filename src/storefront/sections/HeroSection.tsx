import type {CSSProperties} from 'react'
import {Link} from 'react-router-dom'
import {cn} from '@/shared/utils/cn'
import {resolveImageUrl} from '@/shared/utils/imageUrl'
import type {BenefitsFootnoteSegment, HeroContentSurface, HeroSectionConfig} from '@/shared/types/StorefrontConfig'
import {
    ACCENT_BUTTON_HOVER,
    SECONDARY_BUTTON_HOVER_DARK,
    SECONDARY_BUTTON_HOVER_LIGHT,
    SECTION_WIDTH_CLASS,
    SectionEyebrow,
    SF_FOCUS_RING_PAGE,
} from './shared'
import type {EyebrowTone} from './shared'

// Text/kicker colour per surface. Every value is a theme token — no client
// palette lives here, only the mapping from semantic surface -> token.
const SURFACE_TITLE_CLASS: Record<HeroContentSurface, string> = {
    default: 'text-(--sf-text)',
    brand: 'text-(--sf-accent-text)',
    dark: 'text-(--sf-accent-text)',
}

const SURFACE_SUBTITLE_CLASS: Record<HeroContentSurface, string> = {
    default: 'text-(--sf-muted-text)',
    brand: 'text-(--sf-accent-text)/80',
    dark: 'text-(--sf-accent-text)/80',
}

// The hero kicker IS a SectionEyebrow — same component every section heading
// uses — so this maps the hero's surface vocabulary onto that component's tone.
// `brand` sits on the accent colour itself, where an accent rule would vanish;
// `dark` is a photo or dark chrome, where the accent rule still reads as brand.
const SURFACE_EYEBROW_TONE: Record<HeroContentSurface, EyebrowTone> = {
    default: 'default',
    brand: 'onAccent',
    dark: 'onDark',
}

// Secondary CTAs are outlined, and their hover comes from the shared secondary
// system so they stay quieter than the solid primary beside them. On the light
// `default` surface the label must be accent, because a light label would vanish
// there; `brand` and `dark` carry a light label, so they take the dark wash —
// `brand` because an accent outline would vanish on the accent band itself.
const SURFACE_SECONDARY_CTA_CLASS: Record<HeroContentSurface, string> = {
    default: `border-(--sf-accent) text-(--sf-accent) ${SECONDARY_BUTTON_HOVER_LIGHT}`,
    brand: `border-(--sf-accent-text)/50 text-(--sf-accent-text) ${SECONDARY_BUTTON_HOVER_DARK}`,
    dark: `border-(--sf-accent) text-(--sf-accent-text) ${SECONDARY_BUTTON_HOVER_DARK}`,
}

// Background for surfaces that have no photo behind them. `default` is a
// plain tokenised panel (handled via Tailwind class, not inline style) so it
// stays out of this map. `dark` falls back through the same "dark chrome"
// token CtaSection already uses, so hero and CTA bands agree on what "dark"
// means for a given client.
const SURFACE_BACKGROUND_STYLE: Partial<Record<HeroContentSurface, CSSProperties>> = {
    brand: {background: 'var(--sf-accent)'},
    dark: {background: 'var(--sf-surface-dark, var(--sf-nav-background, #111827))'},
}

// Band height per the `height` display hint.
//
// 'tall' reserves ~360px for chrome plus the following band, so the next
// section's top edge stays above the fold.
//
// 'full' fills the viewport once chrome is subtracted, via the `--sf-chrome-h`
// published by useChromeHeight. The 0px fallback covers the pre-measure frame
// and any hero rendered outside StorefrontLayout, degrading to a plain
// full-viewport band. `dvh` tracks mobile chrome collapsing on scroll.
//
// Both keep a px floor so a short window still gets a usable band.
// Panel skin. Both entries are `bg-black/*` — a documented overlay exception.
// A token would be wrong: the panel darkens whatever is behind it rather than
// carrying a client colour.
//
// Over a photo a bounded panel guarantees contrast but cuts a visible rectangle
// out of the image; use `overlayStyle: 'gradient-left'` for the same contrast
// without the seam. With no photo the band supplies the colour and the panel
// only bounds the copy, hence the lighter wash.
const PANEL_CLASS = {
    onImage: 'bg-black/40 backdrop-blur-sm',
    onBand: 'bg-black/10 backdrop-blur-sm',
} as const

/**
 * Scrim over the background photo.
 *
 * 'uniform' is the original flat wash: one opacity across the whole image.
 *
 * 'gradient-left' ramps from `opacity` at the leading edge to fully transparent
 * by 80%. The stops hold near-full strength through 35% — the copy column runs
 * to roughly 57% of the viewport — then fall away, so the ramp is doing real
 * work everywhere text sits and nothing where it doesn't. The intermediate stop
 * is what keeps the falloff smooth; a two-stop ramp puts a visible band across
 * the middle of the photograph, which is the seam this treatment exists to
 * avoid. `.toFixed(3)` keeps the derived alphas out of float-noise territory in
 * the emitted CSS.
 */
function scrimStyle(style: 'uniform' | 'gradient-left', opacity: number): CSSProperties {
    if (style !== 'gradient-left') {
        return {backgroundColor: '#000', opacity}
    }
    const at = (factor: number) => `rgba(0,0,0,${(opacity * factor).toFixed(3)})`
    return {
        backgroundImage: `linear-gradient(to right, ${at(1)} 0%, ${at(0.95)} 35%, ${at(0.6)} 55%, ${at(0.25)} 70%, rgba(0,0,0,0) 80%)`,
    }
}

/**
 * Sub-`md` companion to the left-to-right ramp.
 *
 * A horizontal ramp is only correct while the copy occupies a COLUMN. On a phone
 * the copy is full-bleed, so every line runs straight through the fade and out
 * onto bare photograph — the right-hand half of the intro and footnote were
 * sitting on an unmasked warehouse trolley. The ramp therefore turns vertical
 * below `md`: it keeps the top of the image open, then holds full strength down
 * through the band where the copy actually sits.
 */
function mobileScrimStyle(opacity: number): CSSProperties {
    const at = (factor: number) => `rgba(0,0,0,${(opacity * factor).toFixed(3)})`
    return {
        backgroundImage: `linear-gradient(to bottom, ${at(0.45)} 0%, ${at(0.9)} 22%, ${at(0.9)} 88%, ${at(0.7)} 100%)`,
    }
}

// Vertical padding rides WITH the height rather than sitting on the section, so
// a band's presence is one decision. A compact band at the standard `py-20`
// spends most of its floor on empty space and stops reading as compact at all.
const HEIGHT_CLASS: Record<'compact' | 'standard' | 'tall' | 'full', string> = {
    compact: 'py-14 min-h-[320px]',
    standard: 'py-20 min-h-[480px]',
    tall: 'py-20 min-h-[max(480px,calc(100vh-360px))]',
    full: 'py-20 min-h-[max(480px,calc(100dvh-var(--sf-chrome-h,0px)))]',
}

export function HeroFootnote({segments, surface, contentAlignment = 'center'}: {
    segments: BenefitsFootnoteSegment[]
    surface: HeroContentSurface
    contentAlignment?: 'left' | 'center' | 'right'
}) {
    return (
        <p
            className={cn(
                // `max-w-xl` matches the subtitle exactly: the footnote is a
                // continuation of the intro, and without a cap it wrapped to the
                // full copy column (max-w-2xl) and visibly overhung the paragraph
                // above it. Centring/right-aligning needs the auto margin too, or
                // the narrower block stays pinned left inside a centred hero.
                'mt-4 max-w-xl text-sm',
                SURFACE_SUBTITLE_CLASS[surface],
                contentAlignment === 'center' && 'mx-auto text-center',
                contentAlignment === 'right' && 'ml-auto text-right',
            )}
        >
            {segments.map((segment, index) =>
                segment.to ? (
                    <Link
                        key={index}
                        to={segment.to}
                        className={cn(
                            'underline transition-colors hover:opacity-80',
                            SF_FOCUS_RING_PAGE,
                        )}
                    >
                        {segment.text}
                    </Link>
                ) : (
                    <span key={index}>{segment.text}</span>
                )
            )}
        </p>
    )
}

export function HeroSection({section}: { section: HeroSectionConfig }) {
    const {
        title,
        subtitle,
        kicker,
        height = 'standard',
        primaryCta,
        secondaryCta,
        backgroundImageUrl,
        overlayOpacity = 0.4,
        overlayStyle = 'uniform',
        contentAlignment = 'center',
        darkStyle = false,
        contentSurface,
        contentPanel,
        footnote,
    } = section.props

    // Storage-relative paths (e.g. "storefront/hero-warehouse.jpg") must go through
    // resolveImageUrl() before use, same rule the header/footer follow — otherwise
    // the browser resolves the URL relative to the current page and 404s. Absolute
    // URLs and already-resolved paths are passed through untouched.
    const resolvedBackground = resolveImageUrl(backgroundImageUrl ?? null) ?? backgroundImageUrl
    const hasImage = !!resolvedBackground

    // Safe-by-default resolution: an explicit `contentSurface` always wins. Failing
    // that, the legacy `darkStyle` flag only takes effect when there's an actual
    // photo behind it — a photo needs a scrim and light text regardless. With no
    // image, a stale `darkStyle: true` (e.g. copied from another section without an
    // image ever being set) must NOT produce light-on-light text, so it's ignored
    // and the tokenised `default` surface is used instead.
    const surface: HeroContentSurface = contentSurface ?? (hasImage && darkStyle ? 'dark' : 'default')

    // Default derivation (unchanged): a bounded panel only where there's no photo
    // to frame the copy. `contentPanel` overrides it in either direction — set
    // true over a photo and the copy gets a constant dark backing instead of
    // relying on the scrim, which dims the whole image equally and therefore
    // cannot guarantee contrast behind any particular line of text.
    const isBoundedPanel = contentPanel ?? (!hasImage && surface !== 'default')

    const copy = (
        <>
                {kicker && (
                    <SectionEyebrow
                        tone={SURFACE_EYEBROW_TONE[surface]}
                        align={contentAlignment}
                        className="mb-3"
                    >
                        {kicker}
                    </SectionEyebrow>
                )}
                {/* Larger from `md`: the band is viewport-tall, and 36px left the
                    title small against it. The block is vertically centred, so
                    growing the title by ~15px pushes the subtitle down by half
                    that — the subtitle's tightened `md:mt-2` gives it back, so the
                    title grows UPWARD into the kicker's space and the subtitle
                    holds its position. */}
                <h2 className={cn('text-4xl md:text-6xl font-bold leading-tight', SURFACE_TITLE_CLASS[surface])}>
                    {title}
                </h2>
                {subtitle && (
                    <p
                        className={cn(
                            'mt-4 md:mt-0 max-w-xl text-lg',
                            SURFACE_SUBTITLE_CLASS[surface],
                            contentAlignment === 'center' && 'mx-auto',
                            contentAlignment === 'right' && 'ml-auto',
                        )}
                    >
                        {subtitle}
                    </p>
                )}
                {(primaryCta || secondaryCta) && (
                    <div
                        className={cn(
                            'mt-8 flex flex-wrap gap-4',
                            contentAlignment === 'center' && 'justify-center',
                            contentAlignment === 'right' && 'justify-end',
                        )}
                    >
                        {primaryCta && (
                            <Link
                                to={primaryCta.to}
                                className={`inline-block rounded-md bg-(--sf-accent) px-6 py-3 text-sm font-semibold text-(--sf-accent-text) shadow-(--sf-shadow-sm) transition-colors ${ACCENT_BUTTON_HOVER} ${SF_FOCUS_RING_PAGE}`}
                            >
                                {primaryCta.label}
                            </Link>
                        )}
                        {secondaryCta && (
                            <Link
                                to={secondaryCta.to}
                                className={cn(
                                    'inline-block rounded-md border-2 px-6 py-3 text-sm font-semibold transition',
                                    SURFACE_SECONDARY_CTA_CLASS[surface],
                                )}
                            >
                                {secondaryCta.label}
                            </Link>
                        )}
                    </div>
                )}
                {footnote && footnote.length > 0 && (
                    <HeroFootnote
                        segments={footnote}
                        surface={surface}
                        contentAlignment={contentAlignment}
                    />
                )}
        </>
    )

    return (
        <section
            aria-label={title}
            className={cn('relative flex items-center px-6 sm:px-8 overflow-hidden', HEIGHT_CLASS[height], {
                'bg-(--sf-panel)': !hasImage && surface === 'default',
            })}
            style={hasImage ? undefined : SURFACE_BACKGROUND_STYLE[surface]}
        >
            {hasImage && (
                <>
                    {/* Explicit <img> + object-cover (not a CSS background) so the image
                        always fills the band exactly — no warp, no container-size drift. */}
                    <img
                        src={resolvedBackground}
                        alt=""
                        aria-hidden="true"
                        className="absolute inset-0 h-full w-full object-cover object-center"
                    />
                    {overlayStyle === 'gradient-left' ? (
                        // Two elements rather than one: the ramp's DIRECTION has to
                        // change at the breakpoint, and a direction cannot be
                        // expressed as a responsive utility on an inline style.
                        <>
                            <div
                                className="absolute inset-0 md:hidden"
                                style={mobileScrimStyle(overlayOpacity)}
                                aria-hidden="true"
                            />
                            <div
                                className="absolute inset-0 hidden md:block"
                                style={scrimStyle(overlayStyle, overlayOpacity)}
                                aria-hidden="true"
                            />
                        </>
                    ) : (
                        <div
                            className="absolute inset-0"
                            style={scrimStyle(overlayStyle, overlayOpacity)}
                            aria-hidden="true"
                        />
                    )}
                </>
            )}
            {/* Content rides the house grid so a left-aligned hero starts at the
                same gutter as every other section (a centered narrow column made
                "left" alignment float mid-page). The width is read from the shared
                frame rather than restated, so the hero cannot fall out of step when
                that frame changes. The text block itself stays copy-width.

                `-translate-y-6` is optical centring, not a layout fix: a block of
                text sitting on true mathematical centre reads as slightly low,
                because the eye weights the mass above the midline. 24px up is the
                correction — it applies to every hero, since the effect is a
                property of centred text rather than of any one page. */}
            <div className={`relative z-10 mx-auto w-full -translate-y-6 ${SECTION_WIDTH_CLASS.default}`}>
                <div
                    className={cn(
                        'max-w-2xl',
                        isBoundedPanel && cn(
                            'rounded-2xl border border-(--sf-accent-text)/15 px-8 py-10 sm:px-10 sm:py-12 shadow-(--sf-shadow-lg)',
                            hasImage ? PANEL_CLASS.onImage : PANEL_CLASS.onBand,
                        ),
                        contentAlignment === 'center' && 'text-center mx-auto',
                        contentAlignment === 'right' && 'text-right ml-auto',
                    )}
                >
                    {copy}
                </div>
            </div>
        </section>
    )
}
