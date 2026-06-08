import {useRef} from 'react'
import {Link} from 'react-router-dom'
import {ProductCard} from '@/features/catalog/ProductCard';
import {
    UVH_SHOWCASE_SHIELD_BY_THEME,
    type UvhShowcaseTheme,
} from '@/tenants/uvh/pages/home/uvhCategoryShowcases.config.ts'
import type {ProductShoppingListItem} from '@/types/shared/ProductTypes.ts'

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
            <div className="w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8 xl:px-10 2xl:px-12">
                <div className="flex flex-row items-end justify-between gap-3">
                    <div>
                        <h2
                            id={`showcase-heading-${sectionId}`}
                            className="text-xl font-bold tracking-tight text-white sm:text-2xl"
                        >
                            {title}
                        </h2>
                        <div className="mt-1.5 h-0.5 w-10 rounded-full bg-white/90"/>
                    </div>
                    <Link
                        to={catalogueHref}
                        className="inline-flex w-fit items-center rounded-full border border-white/25 bg-black/20 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition hover:bg-black/30"
                    >
                        View all
                    </Link>
                </div>

                <div
                    className="mt-5 grid grid-cols-[200px_1fr] items-stretch gap-3 sm:gap-5 lg:grid-cols-[minmax(0,240px)_1fr] lg:gap-6">
                    <div
                        className="flex h-full w-full justify-center self-stretch sm:mx-auto sm:max-w-[min(100%,260px)] lg:mx-0 lg:h-full lg:max-w-none lg:min-h-0">
                        <Link
                            to={catalogueHref}
                            className="flex h-full w-full items-center justify-center transition hover:opacity-95 focus-visible:outline focus-visible:outline-offset-4 focus-visible:outline-white lg:h-full lg:min-h-0"
                        >
                            <img
                                src={resolvedShieldSrc}
                                alt={resolvedShieldAlt}
                                className="h-full max-h-full w-full object-contain object-center drop-shadow-2xl sm:max-h-[min(60vh,360px)] lg:h-full lg:max-h-full lg:min-h-0"
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
                                    className="absolute left-0 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/30 text-white backdrop-blur-md transition hover:bg-black/45 md:flex"
                                    onClick={() => handleScroll(-1)}
                                >
                                    <span className="text-base leading-none">‹</span>
                                </button>
                                <button
                                    type="button"
                                    aria-label={`Scroll ${title} products right`}
                                    className="absolute right-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-black/40 text-lg text-white shadow-lg backdrop-blur-md transition hover:bg-black/55 md:right-0 md:h-9 md:w-9 md:animate-none md:text-base"
                                    onClick={() => handleScroll(1)}
                                >
                                    <span className="leading-none">›</span>
                                </button>
                                <div
                                    ref={scrollerRef}
                                    className="flex gap-3 overflow-x-scroll scroll-smooth pb-3 snap-x snap-mandatory [scrollbar-color:rgba(255,255,255,0.7)_rgba(255,255,255,0.15)] [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar]:block [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-white/15 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/70 md:overflow-x-auto md:[-ms-overflow-style:none] md:[scrollbar-width:none] md:[&::-webkit-scrollbar]:hidden md:px-10"
                                >
                                    {products.map((product) => (
                                        <ProductCard key={product.id} product={product}
                                                     className="w-[min(100%,170px)] snap-start shrink-0"/>
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
