import {Link} from 'react-router-dom';

import {Container} from '@/primitives/container/Container';
import {UvhSectionHeading} from '@/tenants/uvh/components/UvhSectionHeading';

type UvhCtaSectionProps = {
    eyebrow: string;
    title: string;
    description: string;
    cta: {label: string; to: string};
    id?: string;
};

/** Light CTA band — replaces the former UvhGetQuoteCta and UvhWholesaleCta. */
export function UvhCtaSection({eyebrow, title, description, cta, id}: UvhCtaSectionProps) {
    const headingId = id ?? `uvh-cta-${title.toLowerCase().replace(/\s+/g, '-')}`;

    return (
        <section
            className="w-full border-t border-(--sf-border) py-7 sm:py-9 bg-(--sf-bg)"
            aria-labelledby={headingId}
        >
            <Container className="px-4 sm:px-6 lg:px-8" padded={false} size="lg">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between lg:gap-9">
                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                        <header className="max-w-2xl">
                            <UvhSectionHeading eyebrow={eyebrow} id={headingId}>
                                {title}
                            </UvhSectionHeading>
                        </header>
                        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-(--sf-muted-text)">{description}</p>
                    </div>
                    <div className="shrink-0 lg:self-center">
                        <Link
                            to={cta.to}
                            className="inline-flex w-full items-center justify-center rounded-xl border border-red-500/35 bg-[#800010] px-7 py-3 text-center text-sm font-bold text-white shadow-[0_8px_24px_rgba(0,0,0,0.35)] transition hover:bg-[#6d000e] focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-(--sf-ring) sm:w-auto"
                        >
                            {cta.label}
                        </Link>
                    </div>
                </div>
            </Container>
        </section>
    );
}
