import type {ReactNode} from 'react';

import {cn} from '@/utils/cn.ts';

/** Same shell as trust band; used by Customer Reviews (`tenants/uvh/theme.css` → `.uvh-dark-section-gradient`). */
export const UVH_CUSTOMER_REVIEWS_SECTION_BG =
    'uvh-dark-section-gradient relative w-full overflow-hidden py-10 sm:py-12';

export type UvhGradientTrustBandProps = {
    /** Small caps line next to the accent rule */
    eyebrow: string;
    /** Primary heading */
    title?: string;
    /** Optional lead paragraph under the title */
    intro?: string;
    children: ReactNode;
    /**
     * Both use `.uvh-dark-section-gradient` (same as Get a Quote). `customerReviews` adds
     * `relative overflow-hidden` for horizontal review scrolling.
     */
    backdrop?: 'gradient' | 'customerReviews';
};

const SECTION_CLASS = 'uvh-dark-section-gradient w-full py-10 sm:py-12';

const FROSTED_CARD =
    'rounded-xl border border-white/12 bg-white/6 p-4 shadow-[0_12px_28px_rgba(0,0,0,0.25)] backdrop-blur-[1px] sm:p-5';

export {FROSTED_CARD};

/**
 * Dark gradient band used for “Trust & Reassurance” on the home page and
 * matching sections (e.g. Company Overview on About).
 */
export function UvhGradientTrustBand({
    eyebrow,
    title,
    intro,
    children,
    backdrop = 'gradient',
}: UvhGradientTrustBandProps) {
    const inner = (
        <>
            <header>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/75">
                    <span
                        className="mr-2 inline-block h-px w-5 align-middle bg-(--sf-accent)"
                        aria-hidden
                    />
                    {eyebrow}
                </p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight text-white">{title}</h2>
                {intro ? (
                    <p className="mt-2 max-w-2xl text-sm text-white/80 sm:text-base">{intro}</p>
                ) : null}
            </header>
            {children}
        </>
    );

    return (
        <section
            className={cn(
                SECTION_CLASS,
                backdrop === 'customerReviews' && 'relative overflow-hidden',
            )}
        >
            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{inner}</div>
        </section>
    );
}
