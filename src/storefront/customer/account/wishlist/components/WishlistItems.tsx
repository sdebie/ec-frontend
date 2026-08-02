import {ProductCard} from '@/storefront/catalog/components/ProductCard'
import {parseVariantLabel} from '@/storefront/catalog/utils/variantLabel'
import type {ViewMode} from '@/storefront/catalog/hooks/useViewPreference'
import {toWishlistCardProduct} from '../mappers'
import type {HydratedWishlistItem} from '../types'
import {UnavailableItemRow} from './UnavailableItemRow'
import {WishlistItemActions} from './WishlistItemActions'

interface WishlistItemsProps {
    availableItems: HydratedWishlistItem[]
    unavailableItems: HydratedWishlistItem[]
    view: ViewMode
    onRequestMove: (item: HydratedWishlistItem, quantity: number) => void
    onRequestRemove: (item: HydratedWishlistItem) => void
}

/**
 * The saved items themselves: unavailable notice rows first (they have no PDP to
 * link to), then the purchasable cards in the persisted view.
 *
 * Each card is wrapped in a `relative` div so `WishlistItemActions` can be
 * positioned over its top-right corner — that is how the wishlist supplies its
 * own remove control without the shared `ProductCard` knowing anything about
 * wishlists. (Its built-in heart is suppressed via `showWishlistButton={false}`,
 * leaving exactly one remove affordance per item.)
 */
export function WishlistItems({
                                  availableItems,
                                  unavailableItems,
                                  view,
                                  onRequestMove,
                                  onRequestRemove,
                              }: WishlistItemsProps) {
    const isRows = view === 'list'

    return (
        <div className="flex flex-col gap-4">
            {unavailableItems.length > 0 && (
                <div className="flex flex-col gap-2">
                    {unavailableItems.map((item) => (
                        <UnavailableItemRow
                            key={item.variantId}
                            item={item}
                            onRemove={() => onRequestRemove(item)}
                        />
                    ))}
                </div>
            )}

            <div
                className={isRows ? 'flex flex-col gap-3' : 'grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3'}
                data-layout={isRows ? 'row' : 'grid'}
            >
                {availableItems.map((item) => (
                    <div key={item.variantId} className="relative">
                        <ProductCard
                            product={toWishlistCardProduct(item)}
                            variantId={item.variantId}
                            variantLabel={parseVariantLabel(item.variantLabel)}
                            outOfStockAction="viewProduct"
                            mobileImage="thumbnail"
                            showWishlistButton={false}
                            onRequestAdd={(quantity) => onRequestMove(item, quantity)}
                            layout={isRows ? 'row' : 'grid'}
                            {...(isRows ? {} : {imageAspect: 'landscape' as const})}
                        />
                        <WishlistItemActions
                            productName={item.productName}
                            onRemove={() => onRequestRemove(item)}
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}
