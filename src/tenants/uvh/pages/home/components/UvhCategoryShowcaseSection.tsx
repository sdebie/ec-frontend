import {useRef} from 'react'
import {Link} from 'react-router-dom'


import { ProductCard } from '@/features/catalog';
import {
    UVH_SHOWCASE_SHIELD_BY_THEME,
    type UvhShowcaseTheme,
} from '@/tenants/uvh/pages/home/uvhCategoryShowcases.config.ts'

import type {ProductShoppingListItem} from '@/types/admin/ProductTypes.ts'

const THEME_GRADIENT: Record<UvhShowcaseTheme, string> = {
    'medical-blue': 'from-sky-500 via-blue-700 to-slate-950',
    'ppe-red': 'from-red-600 via-red-700 to-stone-950',
    'cleaning-green': 'from-green-600 via-emerald-650 to-slate-950',
    'safety-yellow': 'from-yellow-400 via-yellow-600 to-stone-950',
}

export type UvhCategoryShowcaseSectionProps = {
    sectionId: string
    title: string
    theme: UvhShowcaseTheme
    /** Fallback when `categoryId` is not resolved (e.g. API still loading). */
    viewAllTo: string
    /** Root category id for this showcase; drives `/products?category=…` for image + View all. */
    categoryId: string | null
    products: ProductShoppingListItem[]
    loading: boolean
    error: string | null
    /** Optional hero image (e.g. category shield); falls back to abstract panel. */
    decorativeImageSrc?: string
    decorativeImageAlt?: string
}

export function UvhCategoryShowcaseSection({
                                               sectionId,
                                               title,
                                               theme,
                                               viewAllTo,
                                               categoryId,
                                               products,
                                               loading,
                                               error,
                                               decorativeImageSrc,
                                               decorativeImageAlt,
                                           }: UvhCategoryShowcaseSectionProps) {
    const gradient = THEME_GRADIENT[theme]
    const shieldDefaults = UVH_SHOWCASE_SHIELD_BY_THEME[theme]
    const resolvedShieldSrc = decorativeImageSrc ?? shieldDefaults.src
    const resolvedShieldAlt = decorativeImageAlt ?? shieldDefaults.alt
    const scrollerRef = useRef<HTMLDivElement>(null)
    const catalogueHref =
        categoryId != null
            ? `/products?category=${encodeURIComponent(categoryId)}`
            : viewAllTo

    const handleScroll = (direction: -1 | 1) => {
        const el = scrollerRef.current
        if (!el) return
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        const delta = Math.min(320, el.clientWidth * 0.85) * direction
        el.scrollBy({left: delta, behavior: reduceMotion ? 'auto' : 'smooth'})
    }

    return (
        <section
            aria-labelledby={`showcase-heading-${sectionId}`}
            className={`w-full bg-linear-to-br ${gradient} shadow-[0_24px_60px_-32px_rgba(0,0,0,0.55)]`}
        >
            <div className="w-full px-4 py-10 sm:px-6 sm:py-12 lg:px-8 xl:px-10 2xl:px-12">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h2
                            id={`showcase-heading-${sectionId}`}
                            className="text-2xl font-bold tracking-tight text-white sm:text-3xl"
                        >
                            {title}
                        </h2>
                        <div className="mt-2 h-1 w-14 rounded-full bg-white/90"/>
                    </div>
                    <Link
                        to={catalogueHref}
                        className="inline-flex w-fit items-center rounded-full border border-white/25 bg-black/20 px-5 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-black/30"
                    >
                        View all
                    </Link>
                </div>

                <div className="mt-8 grid items-stretch gap-8 lg:grid-cols-[minmax(0,220px)_1fr] lg:gap-10">
                    <div
                        className="mx-auto flex w-full max-w-[min(100%,320px)] justify-center self-stretch lg:mx-0 lg:h-full lg:max-w-none lg:min-h-0">
                        <Link
                            to={catalogueHref}
                            className="flex w-full items-center justify-center transition hover:opacity-95 focus-visible:outline focus-visible:outline-offset-4 focus-visible:outline-white lg:h-full lg:min-h-0"
                        >
                            <img
                                src={resolvedShieldSrc}
                                alt={resolvedShieldAlt}
                                className="h-auto w-full max-h-[min(70vh,420px)] object-contain object-center drop-shadow-2xl lg:h-full lg:max-h-full lg:min-h-0"
                                decoding="async"
                                loading="lazy"
                            />
                        </Link>
                    </div>

                    <div className="relative min-w-0 lg:min-h-0">
                        {loading && (
                            <p className="rounded-2xl border border-white/15 bg-white/10 px-4 py-8 text-center text-sm text-white/90">
                                Loading products…
                            </p>
                        )}
                        {!loading && error && (
                            <p className="rounded-2xl border border-white/15 bg-white/10 px-4 py-8 text-center text-sm text-white">
                                {error}
                            </p>
                        )}
                        {!loading && !error && products.length === 0 && (
                            <p className="rounded-2xl border border-white/15 bg-white/10 px-4 py-8 text-center text-sm text-white/90">
                                No products in this category yet. Try View all to browse the full catalogue.
                            </p>
                        )}
                        {!loading && !error && products.length > 0 && (
                            <>
                                <button
                                    type="button"
                                    aria-label={`Scroll ${title} products left`}
                                    className="absolute left-0 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/30 text-white backdrop-blur-md transition hover:bg-black/45 md:flex"
                                    onClick={() => handleScroll(-1)}
                                >
                                    <span className="text-lg leading-none">‹</span>
                                </button>
                                <button
                                    type="button"
                                    aria-label={`Scroll ${title} products right`}
                                    className="absolute right-0 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/30 text-white backdrop-blur-md transition hover:bg-black/45 md:flex"
                                    onClick={() => handleScroll(1)}
                                >
                                    <span className="text-lg leading-none">›</span>
                                </button>
                                <div
                                    ref={scrollerRef}
                                    className="flex gap-4 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory md:px-12"
                                >
                                    {products.map((product) => (
                                        <ProductCard key={product.id} className="w-[min(100%,260px)] snap-start shrink-0" product={product}/>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </section>
    )
}
