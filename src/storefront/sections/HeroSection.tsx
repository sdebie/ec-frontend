import type {CSSProperties} from 'react'
import {Link} from 'react-router-dom'
import {cn} from '@/shared/utils/cn'
import {resolveImageUrl} from '@/shared/utils/imageUrl'
import type {HeroContentSurface, HeroSectionConfig} from '@/shared/types/StorefrontConfig'

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

const SURFACE_SECONDARY_CTA_CLASS: Record<HeroContentSurface, string> = {
    default: 'border-(--sf-border) text-(--sf-text) hover:bg-(--sf-panel)',
    brand: 'border-(--sf-accent-text)/50 text-(--sf-accent-text) hover:bg-(--sf-accent-text)/10',
    dark: 'border-(--sf-accent-text)/50 text-(--sf-accent-text) hover:bg-(--sf-accent-text)/10',
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

export function HeroSection({section}: { section: HeroSectionConfig }) {
    const {
        title,
        subtitle,
        kicker,
        primaryCta,
        secondaryCta,
        backgroundImageUrl,
        overlayOpacity = 0.4,
        contentAlignment = 'center',
        darkStyle = false,
        contentSurface,
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
            className={cn('relative flex items-center justify-center min-h-[480px] px-6 py-20 overflow-hidden', {
                'bg-cover bg-center': hasImage,
                'bg-(--sf-panel)': !hasImage && surface === 'default',
            })}
            style={hasImage ? {backgroundImage: `url(${resolvedBackground})`} : SURFACE_BACKGROUND_STYLE[surface]}
        >
            {hasImage && (
                <div
                    className="absolute inset-0 bg-black"
                    style={{opacity: overlayOpacity}}
                    aria-hidden="true"
                />
            )}
            <div
                className={cn(
                    'relative z-10 w-full max-w-2xl',
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
                                className="inline-block rounded-md bg-(--sf-accent) px-6 py-3 text-sm font-semibold text-(--sf-accent-text) shadow-(--sf-shadow-sm) transition hover:opacity-90"
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
            </div>
        </section>
    )
}
