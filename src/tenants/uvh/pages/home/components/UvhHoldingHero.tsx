import {FileText, ShoppingBag} from 'lucide-react';
import {Link} from 'react-router-dom';

import {uvhHomeContent} from '@/tenants/uvh/content/uvhContent.ts';

export function UvhHoldingHero() {
    const {hero} = uvhHomeContent;

    return (
        <div className="w-full">
            <section className="relative bg-white" aria-labelledby="uvh-hero-heading">
                <div className="flex min-h-[calc(100dvh-var(--sf-storefront-header-height))] w-full flex-col lg:grid lg:grid-cols-2 lg:items-stretch">
                    <div className="order-2 flex shrink-0 flex-col justify-center gap-3 bg-white px-4 pt-6 pb-6 sm:px-6 lg:order-none lg:col-start-1 lg:row-start-1 lg:min-h-0 lg:gap-3 lg:py-6 lg:pl-8 lg:pr-12 xl:pl-[max(1.5rem,calc((100vw-80rem)/2+1.5rem))]">
                        <p className="max-w-xl text-sm font-semibold uppercase tracking-[0.16em] text-(--sf-accent)">
                            {hero.overline}
                        </p>
                        <h1
                            id="uvh-hero-heading"
                            className="max-w-xl text-balance text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl lg:text-[2.5rem] lg:leading-[1.12]"
                        >
                            {hero.title}
                        </h1>
                        <p className="max-w-xl text-pretty text-sm text-neutral-600 sm:text-base">
                            {hero.subtitle}
                        </p>
                        <div className="flex w-full max-w-xl flex-col gap-3 sm:flex-row sm:flex-wrap">
                            <Link
                                to={hero.primaryCta.to}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-(--sf-accent) px-4 py-2.5 text-sm font-semibold text-(--sf-accent-text) shadow-sm transition-opacity hover:opacity-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--sf-accent) sm:w-auto"
                            >
                                <FileText className="size-5 shrink-0" aria-hidden />
                                {hero.primaryCta.label}
                            </Link>
                            <Link
                                to={hero.secondaryCta.to}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-(--sf-accent) bg-white px-4 py-2.5 text-sm font-semibold text-neutral-950 shadow-sm transition-colors hover:bg-neutral-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--sf-accent) sm:w-auto"
                            >
                                <ShoppingBag className="size-5 shrink-0 text-(--sf-accent)" aria-hidden />
                                {hero.secondaryCta.label}
                            </Link>
                        </div>
                    </div>

                    <div className="relative order-1 min-h-[min(12rem,35svh)] w-full flex-1 lg:order-0 lg:col-start-2 lg:row-start-1 lg:h-full lg:min-h-0 lg:flex-none">
                        <img
                            src={hero.heroImage}
                            alt={hero.heroImageAlt}
                            width={900}
                            height={1200}
                            decoding="async"
                            fetchPriority="high"
                            className="absolute inset-0 size-full object-cover object-center"
                        />
                    </div>
                </div>
            </section>
        </div>
    );
}
