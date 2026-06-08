import {cn} from '@/utils/cn.ts';

type UvhDarkSectionHeadingProps = {
    eyebrow: string;
    title?: string;
    id?: string;
    titleClassName?: string;
};

/**
 * Canonical dark-background section heading for UVH.
 * Renders a small-caps eyebrow (with thicker red accent rule) and an optional h2.
 * For light-background sections use UvhSectionHeading instead.
 */
export function UvhDarkSectionHeading({eyebrow, title, id, titleClassName}: UvhDarkSectionHeadingProps) {
    return (
        <header>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/80">
                <span
                    className="mr-2 inline-block h-0.5 w-4 align-middle bg-(--sf-accent)"
                    aria-hidden
                />
                {eyebrow}
            </p>
            {title ? (
                <h2
                    id={id}
                    className={cn(
                        'mt-1.5 text-2xl font-bold tracking-tight text-white sm:text-3xl',
                        titleClassName,
                    )}
                >
                    {title}
                </h2>
            ) : null}
        </header>
    );
}
