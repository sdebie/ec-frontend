import {ConfirmationDialog} from '@/shared/ui/components'
import type {DialogRequest} from '../types'

interface WishlistDialogsProps {
    request: DialogRequest
    purchasableCount: number
    unavailableCount: number
    onCancel: () => void
    onConfirm: () => void
}

interface DialogCopy {
    title: string
    description: string
    confirmLabel: string
    variant: 'default' | 'danger'
}

/**
 * Copy for every confirmation, in one place so the wording is reviewable
 * together and each dialog always states its consequence before it happens.
 *
 * Confirm labels are deliberately distinct from the buttons that open them
 * ("Remove all" opens → "Remove all items" confirms): two controls sharing one
 * accessible name is an a11y defect, not a naming preference.
 */
function describeDialog(
    request: DialogRequest,
    purchasableCount: number,
    unavailableCount: number,
): DialogCopy {
    switch (request?.kind) {
        case 'moveItem':
            return {
                title: 'Move to cart?',
                description: `"${request.item.productName}" will be added to your cart and removed from your wishlist.`,
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
                description: `"${request.item.productName}" will be removed from your wishlist. This cannot be undone.`,
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
            // Closed — ConfirmationDialog renders nothing when `open` is false.
            return {title: '', description: '', confirmLabel: 'Confirm', variant: 'default'}
    }
}

/** Renders whichever confirmation the page is currently asking for. */
export function WishlistDialogs({
                                    request,
                                    purchasableCount,
                                    unavailableCount,
                                    onCancel,
                                    onConfirm,
                                }: WishlistDialogsProps) {
    const copy = describeDialog(request, purchasableCount, unavailableCount)

    return (
        <ConfirmationDialog
            open={request !== null}
            onClose={onCancel}
            onConfirm={onConfirm}
            title={copy.title}
            description={copy.description}
            confirmLabel={copy.confirmLabel}
            variant={copy.variant}
        />
    )
}
