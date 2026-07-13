import {Link} from 'react-router-dom'
import {cn} from '@/shared/utils/cn'
import {resolveImageUrl} from '@/shared/utils/imageUrl'
import type {HeroSectionConfig} from '@/shared/types/StorefrontConfig'

export function HeroSection({section}: { section: HeroSectionConfig }) {
    const {
        title,
        subtitle,
        primaryCta,
        secondaryCta,
        backgroundImageUrl,
        overlayOpacity = 0.4,
        contentAlignment = 'center',
        darkStyle = false,
    } = section.props

    // Storage-relative paths (e.g. "storefront/hero-warehouse.jpg") must go through
    // resolveImageUrl() before use, same rule the header/footer follow — otherwise
    // the browser resolves the URL relative to the current page and 404s. Absolute
    // URLs and already-resolved paths are passed through untouched.
    const resolvedBackground = resolveImageUrl(backgroundImageUrl ?? null) ?? backgroundImageUrl

    return (
        <section
            aria-label={title}
            className={cn('relative flex items-center justify-center min-h-[480px] px-6 py-20', {
                'bg-cover bg-center': !!resolvedBackground,
            })}
            style={resolvedBackground ? {backgroundImage: `url(${resolvedBackground})`} : undefined}
        >
            {resolvedBackground && (
                <div
                    className="absolute inset-0 bg-black"
                    style={{opacity: overlayOpacity}}
                    aria-hidden="true"
                />
            )}
            <div
                className={cn(
                    'relative z-10 max-w-2xl w-full',
                    contentAlignment === 'center' && 'text-center mx-auto',
                    contentAlignment === 'right' && 'text-right ml-auto',
                )}
            >
                <h2 className={cn('text-4xl font-bold leading-tight', darkStyle ? 'text-white' : 'text-(--sf-text)')}>
                    {title}
                </h2>
                {subtitle && (
                    <p className={cn('mt-4 text-lg', darkStyle ? 'text-gray-200' : 'text-(--sf-muted-text)')}>
                        {subtitle}
                    </p>
                )}
                {(primaryCta || secondaryCta) && (
                    <div
                        className={cn(
                            'mt-8 flex flex-wrap gap-4',
                            darkStyle ? 'text-white' : 'text-(--sf-text)',
                            contentAlignment === 'center' && 'justify-center',
                            contentAlignment === 'right' && 'justify-end',
                        )}
                    >
                        {primaryCta && (
                            <Link
                                to={primaryCta.to}
                                className="inline-block rounded-md bg-(--sf-accent) px-6 py-3 text-sm font-semibold text-(--sf-accent-text) shadow-sm hover:opacity-90"
                            >
                                {primaryCta.label}
                            </Link>
                        )}
                        {secondaryCta && (
                            <Link
                                to={secondaryCta.to}
                                className="inline-block rounded-md border border-current px-6 py-3 text-sm font-semibold hover:opacity-80"
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
