import type {ReactNode} from 'react';
import {cn} from '@/utils/cn.ts';

const DEFAULT_TITLE_CLASS =
    'mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl';

const DEFAULT_DESCRIPTION_CLASS =
    'mt-3 text-sm font-normal leading-relaxed text-white sm:text-base';

export type UvhTitleHeroProps = {
    eyebrow: string;
    title: ReactNode;
    description?: ReactNode;
    /** Rendered below the description (e.g. CTAs); not wrapped in a paragraph */
    afterDescription?: ReactNode;
    /** Inner text column width */
    contentWidth?: 'standard' | 'wide';
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
    contentWidth = 'standard',
    topSlot,
    titleClassName = DEFAULT_TITLE_CLASS,
    descriptionClassName = DEFAULT_DESCRIPTION_CLASS,
    className,
}: UvhTitleHeroProps) {
    return (
        <section
            className={cn('relative w-full overflow-hidden py-8 sm:py-10 lg:py-12', className)}
        >
            <div
                className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,#000000_0%,#0a0202_42%,#2b0505_100%)]"
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

            <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                {topSlot}
                <div
                    className={cn(
                        contentWidth === 'wide' ? 'max-w-3xl lg:max-w-4xl' : 'max-w-xl lg:max-w-2xl',
                        topSlot ? 'mt-4' : undefined,
                    )}
                >
                    <div className="flex items-center gap-3">
                        <span className="h-0.5 w-8 shrink-0 bg-(--sf-accent)" aria-hidden />
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-white">{eyebrow}</p>
                    </div>
                    <h1 className={titleClassName}>{title}</h1>
                    {description ? <p className={descriptionClassName}>{description}</p> : null}
                    {afterDescription ? <div className="mt-5">{afterDescription}</div> : null}
                </div>
            </div>
        </section>
    );
}
