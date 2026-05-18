import {Star} from 'lucide-react';
import {useCallback, useRef} from 'react';

import {UVH_CUSTOMER_REVIEWS_SECTION_BG} from '@/tenants/uvh/components/UvhGradientTrustBand.tsx';
import {uvhHomeContent} from '@/tenants/uvh/content/uvhContent.ts';

function ChevronLeft({className}: {className?: string}) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
        </svg>
    );
}

function ChevronRight({className}: {className?: string}) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
        </svg>
    );
}

export function UvhCustomerReviewsSection() {
    const scrollerRef = useRef<HTMLDivElement>(null);
    const {customerReviewsSection: content} = uvhHomeContent;

    const scrollByDirection = useCallback((dir: -1 | 1) => {
        const el = scrollerRef.current;
        if (!el) return;
        const delta = Math.round(el.clientWidth * 0.75);
        el.scrollBy({left: dir * delta, behavior: 'smooth'});
    }, []);

    return (
        <section
            className={UVH_CUSTOMER_REVIEWS_SECTION_BG}
            aria-labelledby="uvh-customer-reviews-heading"
        >
            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/85">
                    <span className="mr-2 inline-block h-px w-5 align-middle bg-(--sf-accent)"/>
                    {content.overline}
                </p>
                <h2
                    id="uvh-customer-reviews-heading"
                    className="mt-1.5 text-xl font-bold tracking-tight text-white sm:text-2xl"
                >
                    {content.title}
                </h2>

                <div className="mt-4 flex items-center gap-2 md:gap-2.5">
                    <button
                        type="button"
                        onClick={() => scrollByDirection(-1)}
                        className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-full bg-(--sf-accent) text-white shadow-lg transition hover:opacity-90 md:flex"
                        aria-label="Scroll reviews left"
                    >
                        <ChevronLeft className="h-3.5 w-3.5"/>
                    </button>

                    <div
                        ref={scrollerRef}
                        className="min-w-0 flex-1 flex snap-x snap-mandatory gap-2.5 overflow-x-auto scroll-smooth pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:[display:none]"
                    >
                        {content.items.map((item) => (
                            <article
                                key={item.id}
                                className="flex min-h-[140px] w-[min(100%,260px)] shrink-0 snap-start flex-col rounded-xl border border-white/12 bg-white/[0.07] p-3.5 shadow-[0_16px_40px_rgba(0,0,0,0.35)] backdrop-blur-[1px] sm:w-[min(100%,280px)]"
                            >
                                <div className="flex gap-0.5" aria-label="5 out of 5 stars">
                                    {Array.from({length: 5}).map((_, i) => (
                                        <Star
                                            key={i}
                                            className="h-3 w-3 fill-white text-white"
                                            strokeWidth={0}
                                            aria-hidden
                                        />
                                    ))}
                                </div>
                                <p className="mt-2 flex-1 text-[11px] leading-relaxed text-white/95">{item.quote}</p>
                                <p className="mt-2.5 text-[11px] font-bold text-white">{item.author}</p>
                            </article>
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={() => scrollByDirection(1)}
                        className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-full bg-(--sf-accent) text-white shadow-lg transition hover:opacity-90 md:flex"
                        aria-label="Scroll reviews right"
                    >
                        <ChevronRight className="h-3.5 w-3.5"/>
                    </button>
                </div>
            </div>
        </section>
    );
}
