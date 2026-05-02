
import type {ReactNode} from 'react';
import {Link} from 'react-router-dom';

export interface SfUtilityBannerProps {
    /** Announced to assistive tech for the strip region. */
    'aria-label'?: string;
    message: ReactNode;
    ctaTo: string;
    ctaLabel: string;
    className?: string;
}

/** * Top storefront strip (promo / reassurance + CTA). Uses --sf-* tokens. */
export function SfUtilityBanner({
                                    'aria-label': ariaLabel = 'Promotions and quick links',
                                    message,
                                    ctaTo,
                                    ctaLabel,
                                    className = '',
                                }: SfUtilityBannerProps) {
    return (
        <div
            role="region"
            aria-label={ariaLabel}
            className={`border-b border-(--sf-nav-border) bg-black/15 ${className}`.trim()}
        >
            <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-2 text-[11px] text-(--sf-nav-icon-text) sm:px-6 lg:px-8">
                <div className="line-clamp-2 min-w-0 font-medium sm:line-clamp-1">{message}</div>
                <Link
                    to={ctaTo}
                    className="shrink-0 font-semibold text-(--sf-nav-text) hover:text-(--sf-nav-text-hover)"
                >
                    {ctaLabel}
                </Link>
            </div>
        </div>
    );
}