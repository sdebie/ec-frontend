import {UserRoundX, PackageX, type LucideIcon} from 'lucide-react'
import {OrderStatus} from '@/shared/types/enums/OrderStatus'
import type {ConfirmedAction} from './confirmedActions'

export interface TransitionMeta {
  target: OrderStatus
  label: string
  destructive: boolean
  /** Prompt type for moves requiring confirmation. */
  prompt?: ConfirmedAction | 'ship'
  /** Icon + description for the OrderActionsPanel expanded list — set only where the extra
   *  detail earns its place (currently just the two cancel reasons); other transitions render
   *  as plain label-only rows. */
  icon?: LucideIcon
  description?: string
}

export const TRANSITION_META: TransitionMeta[] = [
  { target: OrderStatus.IN_STORE_PAYMENT, label: 'Await In-Store Payment', destructive: false, prompt: 'await-in-store-payment' },
  { target: OrderStatus.PAID, label: 'Mark Paid', destructive: false },
  { target: OrderStatus.PROCESSING, label: 'Start Processing', destructive: false },
  { target: OrderStatus.READY_TO_SHIP, label: 'Ready to Ship', destructive: false },
  { target: OrderStatus.READY_FOR_COLLECTION, label: 'Ready for Collection', destructive: false },
  { target: OrderStatus.IN_TRANSIT, label: 'Ship', destructive: false, prompt: 'ship' },
  { target: OrderStatus.DELIVERED, label: 'Deliver', destructive: false },
  { target: OrderStatus.COLLECTED, label: 'Mark Collected', destructive: false },
  { target: OrderStatus.DELIVERY_FAILED, label: 'Delivery Failed', destructive: false },
  { target: OrderStatus.RETURNED_TO_ORIGIN, label: 'Returned to Store', destructive: false, prompt: 'return-to-origin' },
  {
    target: OrderStatus.USER_CANCELED,
    label: 'Cancel — Customer',
    destructive: true,
    prompt: 'cancel-customer',
    icon: UserRoundX,
    description: 'Customer requested cancellation',
  },
  {
    target: OrderStatus.ADMIN_CANCELED,
    label: 'Cancel — Store',
    destructive: true,
    prompt: 'cancel-staff',
    icon: PackageX,
    description: 'Cancelled by store',
  },
  { target: OrderStatus.PARTIALLY_REFUNDED, label: 'Partial Refund', destructive: true, prompt: 'refund-partial' },
  { target: OrderStatus.REFUNDED, label: 'Refund', destructive: true, prompt: 'refund' },
]
