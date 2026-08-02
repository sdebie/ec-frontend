import type {CSSProperties} from 'react'
import {Link} from 'react-router-dom'
import {cn} from '@/shared/utils/cn'
import {resolveImageUrl} from '@/shared/utils/imageUrl'
import type {BenefitsFootnoteSegment, HeroContentSurface, HeroSectionConfig} from '@/shared/types/StorefrontConfig'
import {ACCENT_BUTTON_HOVER, SF_FOCUS_RING_PAGE} from './shared'

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

const SURFACE_KICKER_CLASS: Record<HeroContentSurface, string> = {
    default: 'text-(--sf-accent)',
    brand: 'text-(--sf-accent-text)/90',
    dark: 'text-(--sf-accent-text)/90',
}

// Secondary CTAs are accent-outlined and fill with an accent-derived tint on
// hover (color-mix with white — same accent-derivation family as the Section
// dark glow; no literal palette). On the dark surface the label stays light
// (owner UX call 2026-07-24); on the light `default` surface it must be accent
// (a light label would vanish). `brand` keeps accent-text styling because an
// accent outline would vanish on the accent band itself.
const SURFACE_SECONDARY_CTA_CLASS: Record<HeroContentSurface, string> = {
    default: 'border-(--sf-accent) text-(--sf-accent) hover:bg-[color-mix(in_srgb,var(--sf-accent)_80%,white)] hover:text-(--sf-accent-text)',
    brand: 'border-(--sf-accent-text)/50 text-(--sf-accent-text) hover:bg-(--sf-accent-text)/10',
    dark: 'border-(--sf-accent) text-(--sf-accent-text) hover:bg-[color-mix(in_srgb,var(--sf-accent)_80%,white)] hover:text-(--sf-accent-text)',
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

// Band height per the `height` display hint. 'tall' is viewport-relative but
// reserves ~360px for the page chrome plus the band that follows the hero, so
// the next section's top edge stays visible above the fold; the px floor keeps
// short windows from collapsing the band below a usable minimum.
//
// 'full' fills the viewport exactly once the chrome is subtracted:
// `--sf-chrome-h` is the measured announcement-bar + header height published by
// StorefrontLayout's useChromeHeight. The 0px fallback covers the frame before
// the measurement lands (and any surface rendering a hero outside that layout),
// where it degrades to a plain full-viewport band rather than breaking. `dvh`
// tracks mobile browser chrome collapsing on scroll; the px floor is retained
// so a short landscape window still gets a usable band.
const HEIGHT_CLASS: Record<'standard' | 'tall' | 'full', string> = {
    standard: 'min-h-[480px]',
    tall: 'min-h-[max(480px,calc(100vh-360px))]',
    full: 'min-h-[max(480px,calc(100dvh-var(--sf-chrome-h,0px)))]',
}

export function HeroFootnote({segments, surface, contentAlignment = 'center'}: {
    segments: BenefitsFootnoteSegment[]
    surface: HeroContentSurface
    contentAlignment?: 'left' | 'center' | 'right'
}) {
    return (
        <p
            className={cn(
                'mt-4 text-sm',
                SURFACE_SUBTITLE_CLASS[surface],
                contentAlignment === 'center' && 'text-center',
                contentAlignment === 'right' && 'text-right',
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
        contentAlignment = 'center',
        darkStyle = false,
        contentSurface,
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

    // A bounded content panel only makes sense when there's no photo to frame the
    // copy — on a photo, the scrim already does that job.
    const isBoundedPanel = !hasImage && surface !== 'default'

    return (
        <section
            aria-label={title}
            className={cn('relative flex items-center px-6 sm:px-8 py-20 overflow-hidden', HEIGHT_CLASS[height], {
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
                    <div
                        className="absolute inset-0 bg-black"
                        style={{opacity: overlayOpacity}}
                        aria-hidden="true"
                    />
                </>
            )}
            {/* Content rides the house max-w-5xl grid so a left-aligned hero starts at
                the same gutter as every other section (a centered narrow column made
                "left" alignment float mid-page). The text block stays copy-width. */}
            <div className="relative z-10 mx-auto w-full max-w-5xl">
            <div
                className={cn(
                    'max-w-2xl',
                    isBoundedPanel && 'rounded-2xl border border-(--sf-accent-text)/15 bg-black/10 px-8 py-10 sm:px-10 sm:py-12 shadow-(--sf-shadow-lg) backdrop-blur-sm',
                    contentAlignment === 'center' && 'text-center mx-auto',
                    contentAlignment === 'right' && 'text-right ml-auto',
                )}
            >
                {kicker && (
                    <p
                        className={cn(
                            'mb-3 text-xs font-semibold uppercase tracking-widest',
                            SURFACE_KICKER_CLASS[surface],
                        )}
                    >
                        {kicker}
                    </p>
                )}
                <h2 className={cn('text-4xl font-bold leading-tight', SURFACE_TITLE_CLASS[surface])}>
                    {title}
                </h2>
                {subtitle && (
                    <p
                        className={cn(
                            'mt-4 max-w-xl text-lg',
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
            </div>
            </div>
        </section>
    )
}
