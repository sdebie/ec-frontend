import {Link} from 'react-router-dom'
import {cn} from '@/shared/utils/cn'
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

    return (
        <section
            aria-label={title}
            className={cn('relative flex items-center justify-center min-h-[480px] px-6 py-20', {
                'bg-cover bg-center': !!backgroundImageUrl,
            })}
            style={backgroundImageUrl ? {backgroundImage: `url(${backgroundImageUrl})`} : undefined}
        >
            {backgroundImageUrl && (
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
                <h2 className={cn('text-4xl font-bold leading-tight', darkStyle ? 'text-white' : 'text-gray-900')}>
                    {title}
                </h2>
                {subtitle && (
                    <p className={cn('mt-4 text-lg', darkStyle ? 'text-gray-200' : 'text-gray-600')}>
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
                            <Link to={primaryCta.to} className="btn-primary">{primaryCta.label}</Link>
                        )}
                        {secondaryCta && (
                            <Link to={secondaryCta.to} className="btn-secondary">{secondaryCta.label}</Link>
                        )}
                    </div>
                )}
            </div>
        </section>
    )
}
