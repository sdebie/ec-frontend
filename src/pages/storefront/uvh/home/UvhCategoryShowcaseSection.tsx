import {useRef} from 'react'
import {Link} from 'react-router-dom'
import type {ProductShoppingListItem} from '@/types/admin/ProductTypes.ts'
import {
    UVH_SHOWCASE_SHIELD_BY_THEME,
    type UvhShowcaseTheme,
} from '@/pages/storefront/uvh/home/uvhCategoryShowcases.config.ts'

const THEME_GRADIENT: Record<UvhShowcaseTheme, string> = {
    'medical-blue': 'from-sky-600 via-blue-900 to-slate-950',
    'ppe-red': 'from-rose-600 via-red-900 to-stone-950',
    'cleaning-green': 'from-emerald-600 via-teal-900 to-slate-950',
    'safety-yellow': 'from-amber-500 via-amber-800 to-stone-900',
}

function formatRand(value: number): string {
    return `R ${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0')}`
}

function pickFeaturedImage(product: ProductShoppingListItem): string | undefined {
    return product.images?.find((img) => img.isFeatured)?.imageUrl ?? product.images?.[0]?.imageUrl
}

function getRetailDisplay(product: ProductShoppingListItem): {price: number; originalPrice?: number} {
    const retail = product.retailPrice?.price ?? 0
    const sale = product.retailSalePrice?.price ?? undefined
    if (sale != null && sale > 0 && retail > sale) {
        return {price: sale, originalPrice: retail}
    }
    return {price: retail}
}

function UvhShowcaseProductCard({product}: {product: ProductShoppingListItem}) {
    const image = pickFeaturedImage(product)
    const {price, originalPrice} = getRetailDisplay(product)
    const wholesale = product.wholesalePrice?.price ?? product.wholesaleSalePrice?.price ?? undefined

    return (
        <article className="w-[min(100%,260px)] shrink-0 snap-start">
            <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-(--sf-panel) shadow-[0_20px_40px_-28px_rgba(0,0,0,0.45)]">
                <Link
                    to={`/product/${product.id}`}
                    className="relative block aspect-square bg-(--sf-bg)"
                >
                    {image ? (
                        <img src={image} alt={product.name} className="h-full w-full object-cover" />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-(--sf-muted-text)">
                            <span className="text-xs">No image</span>
                        </div>
                    )}
                    <div className="absolute right-2 top-2 flex flex-col gap-1.5">
                        <Link
                            to={`/product/${product.id}`}
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-(--sf-accent) text-(--sf-accent-text) shadow-md transition hover:opacity-90"
                            aria-label={`View ${product.name}`}
                        >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                            </svg>
                        </Link>
                        <Link
                            to={`/product/${product.id}`}
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-(--sf-border) bg-(--sf-panel)/95 text-(--sf-accent) shadow-md backdrop-blur-sm transition hover:bg-(--sf-surface-muted)"
                            aria-label={`Save ${product.name}`}
                        >
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                            </svg>
                        </Link>
                    </div>
                </Link>
                <div className="flex flex-1 flex-col p-4">
                    <Link to={`/product/${product.id}`} className="block min-h-[2.75rem]">
                        <h3 className="line-clamp-2 text-sm font-semibold text-(--sf-text)">{product.name}</h3>
                    </Link>
                    <div className="mt-3 space-y-1">
                        <p className="text-base font-bold text-(--sf-accent)">
                            {formatRand(price)}
                            <span className="ml-1 text-xs font-semibold text-(--sf-muted-text)">Ex. VAT</span>
                        </p>
                        {originalPrice != null && originalPrice > price && (
                            <p className="text-xs text-(--sf-muted-text) line-through">
                                {formatRand(originalPrice)}
                            </p>
                        )}
                        {wholesale != null && wholesale > 0 && (
                            <p className="text-xs text-(--sf-muted-text)">
                                Wholesale: {formatRand(wholesale)}
                            </p>
                        )}
                    </div>
                    <Link
                        to={`/product/${product.id}`}
                        className="mt-4 block w-full rounded-xl bg-(--sf-accent) py-2.5 text-center text-sm font-semibold text-(--sf-accent-text) transition hover:opacity-95"
                    >
                        View product
                    </Link>
                </div>
            </div>
        </article>
    )
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
            className={`w-full bg-gradient-to-br ${gradient} shadow-[0_24px_60px_-32px_rgba(0,0,0,0.55)]`}
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
                        <div className="mt-2 h-1 w-14 rounded-full bg-white/90" />
                    </div>
                    <Link
                        to={catalogueHref}
                        className="inline-flex w-fit items-center rounded-full border border-white/25 bg-black/20 px-5 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-black/30"
                    >
                        View all
                    </Link>
                </div>

                <div className="mt-8 grid items-stretch gap-8 lg:grid-cols-[minmax(0,220px)_1fr] lg:gap-10">
                    <div className="mx-auto flex w-full max-w-[min(100%,320px)] justify-center self-stretch lg:mx-0 lg:h-full lg:max-w-none lg:min-h-0">
                        <Link
                            to={catalogueHref}
                            className="flex w-full items-center justify-center transition hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white lg:h-full lg:min-h-0"
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
                                        <UvhShowcaseProductCard key={product.id} product={product} />
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
