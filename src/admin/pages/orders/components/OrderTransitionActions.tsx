import {Button} from '@/shared/ui/primitives'
import {OrderStatus} from '@/shared/types/enums/OrderStatus'
import type {ConfirmedAction} from '../utils/confirmedActions'
import {getAvailableTransitions} from '../utils/getAvailableTransitions'

interface TransitionButton {
    target: OrderStatus
    label: string
    variant: 'solid' | 'outline'
    /**
     * What has to happen before the move. Absent runs it immediately; a ConfirmedAction
     * asks first, because the move ends the order or emails the customer; `'ship'` collects
     * courier details, the one thing a staff member supplies that the server cannot know.
     */
    prompt?: ConfirmedAction | 'ship'
}

/**
 * One entry per status a staff member can move an order to. The list is exhaustive on
 * purpose and filtered at render against what the order's current status actually admits,
 * so a status appearing here is an offer, not a claim that it is reachable.
 */
const TRANSITIONS: TransitionButton[] = [
    {
        target: OrderStatus.IN_STORE_PAYMENT,
        label: 'Await In-Store Payment',
        variant: 'solid',
        prompt: 'await-in-store-payment',
    },
    {target: OrderStatus.PAID, label: 'Mark Paid', variant: 'solid'},
    {target: OrderStatus.PROCESSING, label: 'Start Processing', variant: 'solid'},
    {target: OrderStatus.READY_TO_SHIP, label: 'Ready to Ship', variant: 'solid'},
    {target: OrderStatus.READY_FOR_COLLECTION, label: 'Ready for Collection', variant: 'solid'},
    {target: OrderStatus.IN_TRANSIT, label: 'Ship', variant: 'solid', prompt: 'ship'},
    {target: OrderStatus.DELIVERED, label: 'Deliver', variant: 'solid'},
    {target: OrderStatus.COLLECTED, label: 'Mark Collected', variant: 'solid'},
    {target: OrderStatus.DELIVERY_FAILED, label: 'Delivery Failed', variant: 'outline'},
    {
        target: OrderStatus.RETURNED_TO_ORIGIN,
        label: 'Returned to Store',
        variant: 'outline',
        prompt: 'return-to-origin',
    },
    {
        target: OrderStatus.USER_CANCELED,
        label: 'Cancel — Customer',
        variant: 'outline',
        prompt: 'cancel-customer',
    },
    {
        target: OrderStatus.ADMIN_CANCELED,
        label: 'Cancel — Store',
        variant: 'outline',
        prompt: 'cancel-staff',
    },
    {
        target: OrderStatus.PARTIALLY_REFUNDED,
        label: 'Partial Refund',
        variant: 'outline',
        prompt: 'refund-partial',
    },
    {target: OrderStatus.REFUNDED, label: 'Refund', variant: 'outline', prompt: 'refund'},
]

interface OrderTransitionActionsProps {
    status: OrderStatus
    onMove: (status: OrderStatus) => void
    onConfirm: (action: ConfirmedAction) => void
    onShip: () => void
}

export function OrderTransitionActions({
                                           status,
                                           onMove,
                                           onConfirm,
                                           onShip,
                                       }: OrderTransitionActionsProps) {

    const available = getAvailableTransitions(status)
    const offered = TRANSITIONS.filter((transition) => available.includes(transition.target))

    if (offered.length === 0) {
        return null
    }

    const press = (transition: TransitionButton) => () => {
        if (transition.prompt === 'ship') {
            onShip()
        } else if (transition.prompt) {
            onConfirm(transition.prompt)
        } else {
            onMove(transition.target)
        }
    }

    return (
        <div className="flex flex-wrap gap-3" data-testid="order-action-buttons">
            {offered.map((transition) => (
                <Button
                    key={transition.target}
                    variant={transition.variant}
                    size="sm"
                    onClick={press(transition)}
                >
                    {transition.label}
                </Button>
            ))}
        </div>
    )
}
