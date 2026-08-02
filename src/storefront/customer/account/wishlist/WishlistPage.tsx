import {useEffect, useRef, useState} from 'react'
import {SectionHeading} from '@/storefront/sections/shared'
import {ViewToggle} from '@/storefront/catalog/components/ViewToggle'
import {useViewPreference} from '@/storefront/catalog/hooks/useViewPreference'
import {parseVariantLabel} from '@/storefront/catalog/utils/variantLabel'
import {useCustomerAuthStore} from '@/shared/auth/customerAuthStore'
import {useCartStore} from '@/storefront/cart/store/cartStore.ts'
import {useEffectiveWishlist} from './hooks/useEffectiveWishlist'
import {useWishlistHydration} from './hooks/useWishlistHydration'
import {useToggleEffective} from './hooks/useToggleEffective'
import {useWishlistSelection} from './hooks/useWishlistSelection'
import {useLocalWishlistStore} from './store/localWishlistStore'
import type {DialogRequest, HydratedWishlistItem} from './types'
import {WishlistShell} from './components/WishlistShell'
import {WishlistSkeleton} from './components/WishlistSkeleton'
import {WishlistErrorState} from './components/WishlistErrorState'
import {WishlistEmptyState} from './components/WishlistEmptyState'
import {WishlistItems} from './components/WishlistItems'
import {WishlistSummary} from './components/WishlistSummary'
import {WishlistDialogs} from './components/WishlistDialogs'

/**
 * Orchestrates the wishlist: loads the saved items, derives their availability,
 * and owns the two things that must live in exactly one place — every mutation
 * (cart writes and wishlist removals) and the confirmation each one requires.
 *
 * Presentation is delegated: `WishlistItems` renders the items, `WishlistSummary`
 * the totals and bulk actions, `WishlistDialogs` the confirmations, and the
 * state screens their own components.
 */
export function WishlistPage() {
    const {variantIds, isLoading: wishlistLoading} = useEffectiveWishlist()
    const {
        data: items,
        isLoading: hydrationLoading,
        isError: hydrationError,
    } = useWishlistHydration(Array.from(variantIds))
    const isSignedIn = useCustomerAuthStore((s) => s.isSignedIn)
    const [view, setView] = useViewPreference('wishlist-view-preference')
    const {toggle} = useToggleEffective()

    const [dialog, setDialog] = useState<DialogRequest>(null)
    const [movedConfirmation, setMovedConfirmation] = useState<number | null>(null)
    const movedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const {availableItems, unavailableItems, purchasableItems, estimatedSubtotal, isPurchasable} =
        useWishlistSelection(items ?? [])

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

    /** Move = add to cart, then drop from the wishlist. The `isPurchasable` guard
     *  is applied HERE, at the single cart-write site, so a disabled or
     *  out-of-stock product can never reach the cart whatever the caller does. */
    function moveToCart(requests: Array<{ item: HydratedWishlistItem; quantity: number }>) {
        const addItem = useCartStore.getState().addItem
        const moved: string[] = []

        for (const {item, quantity} of requests) {
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

        if (moved.length > 0) {
            setMovedConfirmation(moved.length)
            if (movedTimeoutRef.current) clearTimeout(movedTimeoutRef.current)
            movedTimeoutRef.current = setTimeout(() => setMovedConfirmation(null), 4000)
        }
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
                    for (const item of items ?? []) toggle(item.variantId, false)
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

    // The heading is present in EVERY state, so each early return renders it too.
    const heading = <SectionHeading as="h1" title="Wishlist" className="mb-0"/>

    if (wishlistLoading || hydrationLoading) {
        return (
            <WishlistShell isSignedIn={isSignedIn}>
                {heading}
                <WishlistSkeleton view={view}/>
            </WishlistShell>
        )
    }

    if (hydrationError) {
        return (
            <WishlistShell isSignedIn={isSignedIn}>
                {heading}
                <WishlistErrorState/>
            </WishlistShell>
        )
    }

    if (!items || items.length === 0) {
        return (
            <WishlistShell isSignedIn={isSignedIn}>
                {heading}
                <WishlistEmptyState/>
            </WishlistShell>
        )
    }

    return (
        <WishlistShell isSignedIn={isSignedIn}>
            {heading}

            {/* Toolbar row — ViewToggle right-aligned above a divider, matching the
                catalogue's toolbar rhythm (CatalogToolbar uses the same classes). */}
            <div className="flex items-center justify-end border-b border-(--sf-border) pb-4">
                <ViewToggle view={view} onViewChange={setView}/>
            </div>

            {/* Items beside a sticky summary on lg+; below lg the summary stacks
                FIRST so the bulk actions stay reachable without scrolling past the
                list (R6.7). */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
                <div className="lg:col-span-2">
                    <WishlistItems
                        availableItems={availableItems}
                        unavailableItems={unavailableItems}
                        view={view}
                        onRequestMove={(item, quantity) => setDialog({kind: 'moveItem', item, quantity})}
                        onRequestRemove={(item) => setDialog({kind: 'removeItem', item})}
                    />
                </div>

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

            <WishlistDialogs
                request={dialog}
                purchasableCount={purchasableItems.length}
                unavailableCount={unavailableItems.length}
                onCancel={() => setDialog(null)}
                onConfirm={confirmDialog}
            />
        </WishlistShell>
    )
}
