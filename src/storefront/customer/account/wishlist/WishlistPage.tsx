import {type ReactNode, useEffect, useRef, useState} from 'react'
import {Section, SectionHeading} from '@/storefront/sections/shared'
import {Link} from 'react-router-dom'
import {Heart} from 'lucide-react'
import {useEffectiveWishlist} from './useEffectiveWishlist'
import {type HydratedWishlistItem, useWishlistHydration} from './useWishlistHydration'
import {useLocalWishlistStore} from './localWishlistStore'
import {useCustomerAuthStore} from '@/shared/auth/customerAuthStore'
import {ProductCard} from '@/storefront/catalog/components/ProductCard'
import {ViewToggle} from '@/storefront/catalog/components/ViewToggle'
import {useViewPreference} from '@/storefront/catalog/hooks/useViewPreference'
import {toWishlistCardProduct} from './wishlistCardAdapter'
import {parseVariantLabel} from '@/storefront/catalog/utils/variantLabel'
import {UnavailableItemRow} from './UnavailableItemRow'
import {WishlistSummary} from './WishlistSummary'
import {useToggleEffective} from './useToggleEffective'
import {useCartStore} from '@/storefront/cart/cartStore'
import {getDisplayPrice} from '@/storefront/catalog/utils/pricing'
import {ConfirmationDialog} from '@/shared/ui/components'
import {WishlistItemActions} from './WishlistItemActions'

/** What the page is currently asking the user to confirm. */
type DialogRequest =
    | null
    | { kind: 'moveItem'; item: HydratedWishlistItem; quantity: number }
    | { kind: 'moveAll' }
    | { kind: 'removeItem'; item: HydratedWishlistItem }
    | { kind: 'removeAll' }
    | { kind: 'removeUnavailable' }

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
    const {data: items, isLoading: hydrationLoading, isError: hydrationError} = useWishlistHydration(Array.from(variantIds))
    const isSignedIn = useCustomerAuthStore((s) => s.isSignedIn)
    const [view, setView] = useViewPreference('wishlist-view-preference')
    const {toggle} = useToggleEffective()
    const customerType = useCustomerAuthStore((s) => s.customerType)
    const [dialog, setDialog] = useState<DialogRequest>(null)
    const [movedConfirmation, setMovedConfirmation] = useState<number | null>(null)
    const movedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => () => {
        if (movedTimeoutRef.current) clearTimeout(movedTimeoutRef.current)
    }, [])

    // Prune variant IDs not returned by the hydration endpoint (signed-out only).
    // With the widened contract, absence means the variant no longer exists at all
    // (hard-deleted). Unavailable and out-of-stock items ARE in the response and
    // are never pruned.
    //
    // `variantIds` is the Zustand store's own Set reference on the signed-out path
    // (the only path this effect runs on), so it is referentially stable; the ID
    // array is derived inside the effect rather than passed through the dependency
    // array, which is what stops this from re-running on every render.
    useEffect(() => {
        if (isSignedIn || !items || hydrationLoading) return
        const hydratedIds = new Set(items.map((i) => i.variantId))
        const localStore = useLocalWishlistStore.getState()
        for (const id of Array.from(localStore.variantIds)) {
            if (!hydratedIds.has(id)) localStore.remove(id)
        }
    }, [items, isSignedIn, hydrationLoading, variantIds])

    const isLoading = wishlistLoading || hydrationLoading
    if (isLoading) {
        return (
            <WishlistShell isSignedIn={isSignedIn}>
                <SectionHeading as="h1" title="Wishlist" className="mb-0"/>
                {view === 'list' ? (
                    <div className="flex flex-col gap-3" data-layout="row">
                        {Array.from({length: 6}).map((_, i) => (
                            <div
                                key={i}
                                className="h-20 animate-pulse rounded-lg bg-(--sf-surface-muted)"
                            />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4" data-layout="grid">
                        {Array.from({length: 6}).map((_, i) => (
                            <div
                                key={i}
                                className="aspect-square animate-pulse rounded-lg bg-(--sf-surface-muted)"
                            />
                        ))}
                    </div>
                )}
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

    const unavailableItems = items.filter((i) => i.productActive === false)
    const availableItems = items.filter((i) => i.productActive !== false)

    // Display price via the shared selector — selected, never calculated.
    function displayPriceOf(item: HydratedWishlistItem): number | null {
        return getDisplayPrice({
            retailPrice: item.retailPrice?.price ?? null,
            wholesalePrice: item.wholesalePrice?.price ?? null,
            retailSalePrice: item.retailSalePrice?.active ? item.retailSalePrice.price : null,
            wholesaleSalePrice: item.wholesaleSalePrice?.active ? item.wholesaleSalePrice.price : null,
        }, customerType).price
    }

    // A disabled product or a non-purchasable variant can NEVER reach the cart.
    // Strict `=== false`: null (unknown) never blocks purchase.
    function isPurchasable(item: HydratedWishlistItem): boolean {
        if (item.productActive === false) return false
        if (item.inStock === false) return false
        return displayPriceOf(item) != null
    }

    const purchasableItems = availableItems.filter(isPurchasable)
    const estimatedSubtotal = purchasableItems.reduce((sum, i) => sum + (displayPriceOf(i) ?? 0), 0)

    function flashMoved(count: number) {
        setMovedConfirmation(count)
        if (movedTimeoutRef.current) clearTimeout(movedTimeoutRef.current)
        movedTimeoutRef.current = setTimeout(() => setMovedConfirmation(null), 4000)
    }

    /** Move = add to cart, then drop from the wishlist. Guarded: a disabled or
     *  unavailable product is never written to the cart, whatever the caller. */
    function moveToCart(list: Array<{ item: HydratedWishlistItem; quantity: number }>) {
        const addItem = useCartStore.getState().addItem
        const moved: string[] = []
        for (const {item, quantity} of list) {
            if (!isPurchasable(item)) continue
            addItem({
                variantId: item.variantId,
                productName: item.productName,
                variantLabel: parseVariantLabel(item.variantLabel),
                quantity,
            })
            moved.push(item.variantId)
        }
        for (const id of moved) toggle(id, false)
        if (moved.length > 0) flashMoved(moved.length)
    }

    function confirmDialog() {
        if (!dialog) return
        switch (dialog.kind) {
            case 'moveItem':
                moveToCart([{item: dialog.item, quantity: dialog.quantity}])
                break
            case 'moveAll':
                moveToCart(purchasableItems.map((item) => ({item, quantity: 1})))
                break
            case 'removeItem':
                toggle(dialog.item.variantId, false)
                break
            case 'removeAll':
                if (isSignedIn) {
                    for (const item of items!) toggle(item.variantId, false)
                } else {
                    useLocalWishlistStore.getState().clear()
                }
                break
            case 'removeUnavailable':
                for (const item of unavailableItems) toggle(item.variantId, false)
                break
        }
        setDialog(null)
    }

    const dialogCopy = describeDialog(dialog, purchasableItems.length, unavailableItems.length)

    return (
        <WishlistShell isSignedIn={isSignedIn}>
            <SectionHeading as="h1" title="Wishlist" className="mb-0"/>

            {/* Toolbar row — ViewToggle right-aligned above a divider, matching the
                catalogue's toolbar rhythm (CatalogToolbar uses the same classes). */}
            <div className="flex items-center justify-end border-b border-(--sf-border) pb-4">
                <ViewToggle view={view} onViewChange={setView} />
            </div>

            {/* Items beside a sticky summary on lg+; on smaller screens the summary
                stacks FIRST so the bulk actions stay reachable without scrolling
                past the list (R6.7). */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
                <div className="flex flex-col gap-4 lg:col-span-2">
                    {/* Unavailable items — full-width notice rows, above the product items in both view modes */}
                    {unavailableItems.length > 0 && (
                        <div className="flex flex-col gap-2">
                            {unavailableItems.map((item) => (
                                <UnavailableItemRow
                                    key={item.variantId}
                                    item={item}
                                    onRemove={() => setDialog({kind: 'removeItem', item})}
                                />
                            ))}
                        </div>
                    )}

                    {/* Product items — grid or list view based on persisted preference */}
                    {view === 'list' ? (
                        <div className="flex flex-col gap-3" data-layout="row">
                            {availableItems.map((item) => (
                                <div key={item.variantId} className="relative">
                                <ProductCard
                                    product={toWishlistCardProduct(item)}
                                    variantId={item.variantId}
                                    variantLabel={parseVariantLabel(item.variantLabel)}
                                    outOfStockAction="viewProduct"
                                    mobileImage="thumbnail"
                                    showWishlistButton={false}
                                    onRequestAdd={(quantity) => setDialog({kind: 'moveItem', item, quantity})}
                                    layout="row"
                                />
                                <WishlistItemActions
                                    productName={item.productName}
                                    onRemove={() => setDialog({kind: 'removeItem', item})}
                                />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3" data-layout="grid">
                            {availableItems.map((item) => (
                                <div key={item.variantId} className="relative">
                                <ProductCard
                                    product={toWishlistCardProduct(item)}
                                    variantId={item.variantId}
                                    variantLabel={parseVariantLabel(item.variantLabel)}
                                    outOfStockAction="viewProduct"
                                    mobileImage="thumbnail"
                                    showWishlistButton={false}
                                    onRequestAdd={(quantity) => setDialog({kind: 'moveItem', item, quantity})}
                                    imageAspect="landscape"
                                    layout="grid"
                                />
                                <WishlistItemActions
                                    productName={item.productName}
                                    onRemove={() => setDialog({kind: 'removeItem', item})}
                                />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* order-first below lg keeps the bulk actions reachable without
                    scrolling past the list (R6.7); at lg+ it returns to DOM order
                    and sits in the right-hand column. */}
                <div className="order-first lg:order-none">
                    <WishlistSummary
                        items={items}
                        purchasableItems={purchasableItems}
                        unavailableCount={unavailableItems.length}
                        estimatedSubtotal={estimatedSubtotal}
                        movedConfirmation={movedConfirmation}
                        onRequestMoveAll={() => setDialog({kind: 'moveAll'})}
                        onRequestRemoveAll={() => setDialog({kind: 'removeAll'})}
                        onRequestRemoveUnavailable={() => setDialog({kind: 'removeUnavailable'})}
                    />
                </div>
            </div>
            <ConfirmationDialog
                open={dialog !== null}
                onClose={() => setDialog(null)}
                onConfirm={confirmDialog}
                title={dialogCopy.title}
                description={dialogCopy.description}
                confirmLabel={dialogCopy.confirmLabel}
                variant={dialogCopy.variant}
            />
        </WishlistShell>
    )
}

/** Copy for each confirmation. Kept out of the component so the wording is
 *  reviewable in one place and the consequence is always stated explicitly. */
function describeDialog(dialog: DialogRequest, purchasableCount: number, unavailableCount: number): {
    title: string
    description: string
    confirmLabel: string
    variant: 'default' | 'danger'
} {
    switch (dialog?.kind) {
        case 'moveItem':
            return {
                title: 'Move to cart?',
                description: `"${dialog.item.productName}" will be added to your cart and removed from your wishlist.`,
                confirmLabel: 'Move to cart',
                variant: 'default',
            }
        case 'moveAll':
            return {
                title: 'Move all to cart?',
                description: `${purchasableCount} ${purchasableCount === 1 ? 'item' : 'items'} will be added to your cart and removed from your wishlist.`,
                confirmLabel: 'Move to cart',
                variant: 'default',
            }
        case 'removeItem':
            return {
                title: 'Remove from wishlist?',
                description: `"${dialog.item.productName}" will be removed from your wishlist. This cannot be undone.`,
                confirmLabel: 'Remove',
                variant: 'danger',
            }
        case 'removeAll':
            return {
                title: 'Remove all items?',
                description: 'Your entire wishlist will be cleared. This cannot be undone.',
                confirmLabel: 'Remove all items',
                variant: 'danger',
            }
        case 'removeUnavailable':
            return {
                title: 'Remove unavailable items?',
                description: `${unavailableCount} unavailable ${unavailableCount === 1 ? 'item' : 'items'} will be removed from your wishlist.`,
                confirmLabel: 'Remove unavailable items',
                variant: 'danger',
            }
        default:
            // Dialog is closed; ConfirmationDialog renders nothing.
            return {title: '', description: '', confirmLabel: 'Confirm', variant: 'default'}
    }
}
