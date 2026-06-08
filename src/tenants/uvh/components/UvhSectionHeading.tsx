import { cn } from '@/utils/cn';

type UvhSectionHeadingProps = {
    children: React.ReactNode;
    id?: string;
    className?: string;
    /** Optional small-caps label rendered above the heading */
    eyebrow?: string;
    eyebrowClassName?: string;
    barClassName?: string;
};

/**
 * Canonical light-background section heading for UVH.
 * Renders an optional eyebrow, an h2, then the brand red accent bar below.
 * For dark-background sections use UvhDarkSectionHeading instead.
 */
export function UvhSectionHeading({ children, id, className, eyebrow, eyebrowClassName, barClassName }: UvhSectionHeadingProps) {
    return (
        <>
            {eyebrow ? (
                <p className={cn('text-xs font-bold uppercase tracking-[0.14em]', eyebrowClassName ?? 'text-(--sf-accent)')}>
                    <span className="mr-2 inline-block h-0.5 w-4 align-middle bg-(--sf-accent)" aria-hidden />
                    {eyebrow}
                </p>
            ) : null}
            <h2
                id={id}
                className={cn(
                    'text-3xl font-bold tracking-tight text-(--sf-text)',
                    eyebrow ? 'mt-1.5' : '',
                    className,
                )}
            >
                {children}
            </h2>
            <span className={cn('block rounded bg-(--sf-accent)', barClassName ?? 'mt-1 h-1 w-7')} aria-hidden />
        </>
    );
}
