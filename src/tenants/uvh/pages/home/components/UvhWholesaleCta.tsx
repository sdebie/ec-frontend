import {Link} from 'react-router-dom';

import {uvhHomeContent} from '@/tenants/uvh/content/uvhContent.ts';

export function UvhWholesaleCta() {
    const {overline, title, description, cta} = uvhHomeContent.wholesaleCta;

    return (
        <section
            className="uvh-dark-section-gradient w-full py-10 sm:py-12"
            aria-labelledby="uvh-wholesale-heading"
        >
            <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 sm:px-6 sm:py-1 lg:flex-row lg:items-center lg:justify-between lg:gap-10 lg:px-8">
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-white">
                        <span
                            className="mr-2 inline-block h-px w-5 align-middle bg-red-600"
                            aria-hidden
                        />
                        {overline}
                    </p>
                    <h2
                        id="uvh-wholesale-heading"
                        className="text-2xl font-bold tracking-tight text-white sm:text-3xl"
                    >
                        {title}
                    </h2>
                    <p className="max-w-2xl text-sm leading-relaxed text-white/90 sm:text-base">
                        {description}
                    </p>
                </div>
                <div className="shrink-0 lg:self-center">
                    <Link
                        to={cta.to}
                        className="inline-flex w-full items-center justify-center rounded-lg border border-[#a52a2a] bg-[#800010] px-6 py-3.5 text-center text-sm font-bold text-white shadow-[0_8px_24px_rgba(0,0,0,0.35)] transition hover:bg-[#6d000e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:w-auto"
                    >
                        {cta.label}
                    </Link>
                </div>
            </div>
        </section>
    );
}
