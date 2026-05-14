import {Link} from 'react-router-dom';

import {uvhHomeContent} from '@/tenants/uvh/content/uvhContent.ts';

export function UvhGetQuoteCta() {
    const {overline, title, description, cta} = uvhHomeContent.getQuoteCta;

    return (
        <section
            className="uvh-dark-section-gradient w-full py-6 sm:py-8"
            aria-labelledby="uvh-get-quote-heading"
        >
            <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 sm:px-6 sm:py-1 lg:flex-row lg:items-center lg:justify-between lg:gap-9 lg:px-8">
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-white">
                        <span
                            className="mr-2 inline-block h-px w-5 align-middle bg-(--sf-accent)"
                            aria-hidden
                        />
                        {overline}
                    </p>
                    <h2
                        id="uvh-get-quote-heading"
                        className="text-2xl font-bold tracking-tight text-white sm:text-3xl"
                    >
                        {title}
                    </h2>
                    <p className="max-w-2xl text-sm leading-relaxed text-white/90">
                        {description}
                    </p>
                </div>
                <div className="shrink-0 lg:self-center">
                    <Link
                        to={cta.to}
                        className="inline-flex w-full items-center justify-center rounded-xl border border-red-500/35 bg-[#800010] px-7 py-3 text-center text-sm font-bold text-white shadow-[0_8px_24px_rgba(0,0,0,0.35)] transition hover:bg-[#6d000e] focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-white sm:w-auto"
                    >
                        {cta.label}
                    </Link>
                </div>
            </div>
        </section>
    );
}
