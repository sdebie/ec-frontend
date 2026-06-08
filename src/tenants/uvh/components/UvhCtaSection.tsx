import {Link} from 'react-router-dom';
import {Container} from '@/primitives/container/Container';
import {cn} from '@/utils/cn';
import {UvhDarkSectionHeading} from '@/tenants/uvh/components/UvhDarkSectionHeading';
import {UvhSectionHeading} from '@/tenants/uvh/components/UvhSectionHeading';

type CtaLink = { label: string; to: string };

type UvhCtaSectionProps = {
    eyebrow: string;
    title: string;
    description: string;
    cta: CtaLink;
    secondaryCta?: CtaLink;
    id?: string;
    ctaClassName?: string;
    /** When true, renders the dark gradient band matching Trust & Reassurance */
    dark?: boolean;
    /** When true, reduces vertical padding */
    compact?: boolean;
};

/** CTA band — light by default; pass `dark` to match the Trust & Reassurance gradient style. */
export function UvhCtaSection({
                                  eyebrow,
                                  title,
                                  description,
                                  cta,
                                  secondaryCta,
                                  id,
                                  ctaClassName,
                                  dark,
                                  compact
                              }: UvhCtaSectionProps) {
    const headingId = id ?? `uvh-cta-${title.toLowerCase().replace(/\s+/g, '-')}`;

    const primaryCls = cn(
        'inline-flex w-full items-center justify-center rounded-xl px-7 py-3 text-center text-sm font-bold text-white shadow-[0_8px_24px_rgba(0,0,0,0.35)] transition focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-(--sf-ring) sm:w-auto',
        ctaClassName ?? 'border border-red-500/35 bg-[#800010] hover:bg-[#6d000e]',
    );

    const secondaryCls =
        'inline-flex w-full items-center justify-center rounded-xl border border-white/25 px-7 py-3 text-center text-sm font-bold text-white transition hover:bg-white/10 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-(--sf-ring) sm:w-auto';

    return (
        <section
            className={cn(
                cn('w-full', compact ? 'py-4 sm:py-5' : 'py-7 sm:py-9'),
                dark ? 'uvh-dark-section-gradient' : 'border-t border-(--sf-border) bg-(--sf-bg)',
            )}
            aria-labelledby={headingId}
        >
            <Container className={cn('px-4 sm:px-6 lg:px-8', dark && 'bg-transparent')} padded={false} size="lg">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between lg:gap-9">
                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                        <header className="max-w-2xl">
                            {dark ? (
                                <UvhDarkSectionHeading eyebrow={eyebrow} title={title} id={headingId}/>
                            ) : (
                                <UvhSectionHeading eyebrow={eyebrow} id={headingId}>
                                    {title}
                                </UvhSectionHeading>
                            )}
                        </header>
                        <p className={cn('mt-2 max-w-2xl text-sm leading-relaxed', dark ? 'text-white/80' : 'text-(--sf-muted-text)')}>
                            {description}
                        </p>
                    </div>
                    <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:self-center">
                        <Link to={cta.to} className={primaryCls}>
                            {cta.label}
                        </Link>
                        {secondaryCta && (
                            <Link to={secondaryCta.to} className={secondaryCls}>
                                {secondaryCta.label}
                            </Link>
                        )}
                    </div>
                </div>
            </Container>
        </section>
    );
}
