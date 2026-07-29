import {type ReactNode, useEffect} from 'react'
import {Section, SectionHeading} from '@/storefront/sections/shared'
import {Link} from 'react-router-dom'
import {Heart, Trash2} from 'lucide-react'
import {useEffectiveWishlist} from './useEffectiveWishlist'
import {type HydratedWishlistItem, useWishlistHydration} from './useWishlistHydration'
import {useToggleEffective} from './useToggleEffective'
import {useLocalWishlistStore} from './localWishlistStore'
import {useCustomerAuthStore} from '@/shared/auth/customerAuthStore'
import {useStorefrontConfig} from '@/shared/config/storefrontConfig.context'
import {resolveImageUrl} from '@/shared/utils/imageUrl'
import {formatAmount} from '@/shared/utils/formatAmount'
import {getDisplayPrice, type VariantPriceTiers} from '@/storefront/catalog/utils/pricing'

/**
 * Adapts a HydratedWishlistItem's price shape into the flat VariantPriceTiers
 * that getDisplayPrice expects. Sale tiers are only used when active === true.
 */
function toVariantPriceTiers(item: HydratedWishlistItem): VariantPriceTiers {
    return {
        retailPrice: item.retailPrice?.price ?? null,
        wholesalePrice: item.wholesalePrice?.price ?? null,
        retailSalePrice:
            item.retailSalePrice?.active ? (item.retailSalePrice.price ?? null) : null,
        wholesaleSalePrice:
            item.wholesaleSalePrice?.active ? (item.wholesaleSalePrice.price ?? null) : null,
    }
}

/**
 * Parses a variant label from JSON attributes string into a readable label.
 * e.g. '{"Size":"Large","Color":"Red"}' → "Size: Large, Color: Red"
 * Falls back to the raw string if parsing fails.
 */
function parseVariantLabel(label: string): string {
    if (!label) return ''
    try {
        const parsed = JSON.parse(label)
        if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
            return Object.entries(parsed)
                .map(([key, value]) => `${key}: ${value}`)
                .join(', ')
        }
        return label
    } catch {
        return label
    }
}

/**
 * Signed in, this page renders inside the account layout, which already provides
 * the page container — only the vertical rhythm is needed here. Signed out it
 * owns the shared page shell (as a div: StorefrontLayout owns the <main>
 * landmark, so a nested one would be invalid).
 */
function WishlistShell({isSignedIn, children}: { isSignedIn: boolean; children: ReactNode }) {
    if (isSignedIn) return <div className="space-y-6">{children}</div>
    return (
        <Section as="div" width="wide">
            <div className="space-y-6">{children}</div>
        </Section>
    )
}

export function WishlistPage() {
    const {variantIds, isLoading: wishlistLoading} = useEffectiveWishlist()
    const ids = Array.from(variantIds)
    const {data: items, isLoading: hydrationLoading, isError: hydrationError} = useWishlistHydration(ids)
    const {toggle} = useToggleEffective()
    const isSignedIn = useCustomerAuthStore((s) => s.isSignedIn)
    const customerType = useCustomerAuthStore((s) => s.customerType)
    const {currency, locale} = useStorefrontConfig()

    // Prune local IDs that failed hydration (signed-out only)
    useEffect(() => {
        if (isSignedIn || !items || hydrationLoading) return
        const hydratedIds = new Set(items.map((i) => i.variantId))
        const localStore = useLocalWishlistStore.getState()
        for (const id of ids) {
            if (!hydratedIds.has(id)) localStore.remove(id)
        }
    }, [items, isSignedIn, hydrationLoading, ids])

    const isLoading = wishlistLoading || hydrationLoading
    if (isLoading) {
        return (
            <WishlistShell isSignedIn={isSignedIn}>
                <SectionHeading as="h1" title="Wishlist" className="mb-0"/>
                <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {Array.from({length: 6}).map((_, i) => (
                        <div
                            key={i}
                            className="aspect-square animate-pulse rounded-lg bg-(--sf-surface-muted)"
                        />
                    ))}
                </div>
            </WishlistShell>
        )
    }

    if (hydrationError) {
        return (
            <WishlistShell isSignedIn={isSignedIn}>
                <SectionHeading as="h1" title="Wishlist" className="mb-0"/>
                <div className="rounded-lg border border-(--sf-border) p-8 text-center">
                    <p className="text-(--sf-muted-text)">
                        We couldn&apos;t load your wishlist. Please try again.
                    </p>
                </div>
            </WishlistShell>
        )
    }

    if (!items || items.length === 0) {
        return (
            <WishlistShell isSignedIn={isSignedIn}>
                <SectionHeading as="h1" title="Wishlist" className="mb-0"/>
                <div className="rounded-lg border border-(--sf-border) p-8 text-center">
                    <Heart className="mx-auto h-12 w-12 text-(--sf-muted-text)"/>
                    <p className="mt-3 text-(--sf-muted-text)">Your wishlist is empty</p>
                    <Link
                        to="/products"
                        className="mt-3 inline-block text-sm font-medium text-(--sf-accent) hover:opacity-80"
                    >
                        Browse products
                    </Link>
                </div>
            </WishlistShell>
        )
    }

    return (
        <WishlistShell isSignedIn={isSignedIn}>
            <SectionHeading as="h1" title="Wishlist" className="mb-0"/>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {items.map((item) => {
                    const imageUrl = resolveImageUrl(item.imagePath)
                    const priceTiers = toVariantPriceTiers(item)
                    const {price, originalPrice} = getDisplayPrice(priceTiers, customerType)
                    const variantLabel = parseVariantLabel(item.variantLabel)

                    return (
                        <div
                            key={item.variantId}
                            className="relative flex h-full flex-col overflow-hidden rounded-lg border border-(--sf-border) bg-(--sf-panel)"
                        >
                            {/* Product image */}
                            <Link to={`/products/${item.productSlug}`} className="block">
                                <div className="aspect-square w-full bg-(--sf-surface-muted)">
                                    {imageUrl ? (
                                        <img
                                            src={imageUrl}
                                            alt={item.productName}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center">
                                            <Heart className="h-8 w-8 text-(--sf-muted-text)"/>
                                        </div>
                                    )}
                                </div>
                            </Link>

                            {/* Product info */}
                            <div className="flex flex-1 flex-col p-4">
                                <Link
                                    to={`/products/${item.productSlug}`}
                                    className="block line-clamp-2 text-sm font-medium text-(--sf-text) hover:text-(--sf-accent)"
                                >
                                    {item.productName}
                                </Link>

                                <div className="mt-auto pt-2">
                                    {variantLabel && (
                                        <p className="text-xs text-(--sf-muted-text)">{variantLabel}</p>
                                    )}

                                    <div className="mt-2 flex items-center gap-2">
                                        {price != null && (
                                            <span className="text-sm font-semibold text-(--sf-text)">
                        {formatAmount(price, currency, locale)}
                      </span>
                                        )}
                                        {originalPrice != null && (
                                            <span className="text-xs text-(--sf-muted-text) line-through">
                        {formatAmount(originalPrice, currency, locale)}
                      </span>
                                        )}
                                        {price == null && (
                                            <span className="text-sm text-(--sf-muted-text)">Price unavailable</span>
                                        )}
                                    </div>
                                </div>

                            </div>

                            <button
                                type="button"
                                onClick={() => toggle(item.variantId, false)}
                                aria-label={`Remove ${item.productName} from wishlist`}
                                className="absolute right-2 top-2 rounded-full bg-(--sf-panel)/90 p-2 text-(--sf-muted-text) shadow-sm backdrop-blur-sm transition-colors hover:text-(--sf-accent)"
                            >
                                <Trash2 className="h-4 w-4" aria-hidden="true"/>
                            </button>
                        </div>
                    )
                })}
            </div>
        </WishlistShell>
    )
}
