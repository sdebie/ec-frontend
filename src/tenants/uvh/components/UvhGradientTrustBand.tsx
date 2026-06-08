import type {ReactNode} from 'react';
import {cn} from '@/utils/cn.ts';
import {UvhDarkSectionHeading} from '@/tenants/uvh/components/UvhDarkSectionHeading.tsx';

/** Same shell as trust band; used by Customer Reviews (`tenants/uvh/theme.css` → `.uvh-dark-section-gradient`). */
export const UVH_CUSTOMER_REVIEWS_SECTION_BG =
    'uvh-dark-section-gradient relative w-full overflow-hidden py-6 sm:py-8';

export type UvhGradientTrustBandProps = {
    /** Small caps line next to the accent rule */
    eyebrow: string;
    /** Primary heading */
    title?: string;
    /** id for the heading element (for aria-labelledby) */
    id?: string;
    /** Optional lead paragraph under the title */
    intro?: string;
    children: ReactNode;
    /**
     * Both use `.uvh-dark-section-gradient` (same as Get a Quote). `customerReviews` adds
     * `relative overflow-hidden` for horizontal review scrolling.
     */
    backdrop?: 'gradient' | 'customerReviews';
};

const SECTION_CLASS = 'uvh-dark-section-gradient w-full py-6 sm:py-8';

const FROSTED_CARD =
    'rounded-xl border border-white/12 bg-white/6 p-4 shadow-[0_12px_28px_rgba(0,0,0,0.25)] backdrop-blur-[1px] sm:p-5';

const DARK_BADGE =
    'flex size-9 shrink-0 items-center justify-center rounded-md bg-(--sf-accent) text-sm font-bold text-(--sf-accent-text)';

export {FROSTED_CARD, DARK_BADGE};

/**
 * Dark gradient band used for “Trust & Reassurance” on the home page and
 * matching sections (e.g. Company Overview on About).
 */
export function UvhGradientTrustBand({
                                         eyebrow,
                                         title,
                                         id,
                                         intro,
                                         children,
                                         backdrop = 'gradient',
                                     }: UvhGradientTrustBandProps) {
    const inner = (
        <>
            <UvhDarkSectionHeading eyebrow={eyebrow} title={title} id={id}/>
            {intro ? (
                <p className="mt-2 max-w-2xl text-sm text-white/80">{intro}</p>
            ) : null}
            {children}
        </>
    );

    return (
        <section
            aria-labelledby={id}
            className={cn(
                SECTION_CLASS,
                backdrop === 'customerReviews' && 'relative overflow-hidden',
            )}
        >
            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{inner}</div>
        </section>
    );
}
