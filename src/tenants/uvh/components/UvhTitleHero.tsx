import {cn} from '@/utils/cn.ts';

import type {ReactNode} from 'react';


const DEFAULT_TITLE_CLASS =
    'mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl';

const DEFAULT_DESCRIPTION_CLASS =
    'mt-2 text-sm font-normal leading-relaxed text-white';

export type UvhTitleHeroProps = {
    eyebrow: string;
    title: ReactNode;
    description?: ReactNode;
    /** Rendered below the description (e.g. CTAs); not wrapped in a paragraph */
    afterDescription?: ReactNode;
    /** Rendered to the right of the content column on lg+ screens */
    rightSlot?: ReactNode;
    /** Inner text column width (`full` matches the hero container for long one-line titles) */
    contentWidth?: 'standard' | 'wide' | 'full';
    /** e.g. back / secondary links above the eyebrow */
    topSlot?: ReactNode;
    titleClassName?: string;
    descriptionClassName?: string;
    className?: string;
};

export function UvhTitleHero({
    eyebrow,
    title,
    description,
    afterDescription,
    rightSlot,
    contentWidth = 'standard',
    topSlot,
    titleClassName = DEFAULT_TITLE_CLASS,
    descriptionClassName = DEFAULT_DESCRIPTION_CLASS,
    className,
}: UvhTitleHeroProps) {
    return (
        <section
            className={cn('relative w-full overflow-hidden py-5 sm:py-6 lg:py-8', className)}
        >
            <div
                className="pointer-events-none absolute inset-0 uvh-dark-section-gradient"
                aria-hidden
            />
            <div
                className="pointer-events-none absolute inset-0 bg-[linear-gradient(155deg,rgba(55,12,12,0.5)_0%,transparent_40%)]"
                aria-hidden
            />
            <div
                className="pointer-events-none absolute inset-y-0 right-0 w-[min(100%,52rem)] bg-[radial-gradient(ellipse_75%_115%_at_100%_50%,rgba(58,10,10,0.55)_0%,transparent_72%)]"
                aria-hidden
            />

            <div className={cn('relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8', rightSlot ? 'flex items-center justify-between gap-8' : undefined)}>
                <div>
                    {topSlot}
                    <div
                        className={cn(
                            contentWidth === 'full'
                                ? 'max-w-none'
                                : contentWidth === 'wide'
                                  ? 'max-w-3xl lg:max-w-4xl'
                                  : 'max-w-xl lg:max-w-2xl',
                            topSlot ? 'mt-4' : undefined,
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <span className="h-0.5 w-8 shrink-0 bg-(--sf-accent)" aria-hidden />
                            <p className="text-xs font-bold uppercase tracking-[0.14em] text-white">{eyebrow}</p>
                        </div>
                        <h1 className={titleClassName}>{title}</h1>
                        {description ? <p className={descriptionClassName}>{description}</p> : null}
                        {afterDescription ? <div className="mt-2">{afterDescription}</div> : null}
                    </div>
                </div>
                {rightSlot ? <div className="hidden shrink-0 lg:flex lg:flex-row lg:flex-wrap lg:gap-3">{rightSlot}</div> : null}
            </div>
        </section>
    );
}
