import * as React from 'react'
import { OrderStatus, OrderStatusOptions } from '@/shared/types/enums'
import { StatusBadge } from './StatusBadge'

export interface OrderStatusDisplayProps {
  status: OrderStatus | string
}

export const OrderStatusDisplay: React.FC<OrderStatusDisplayProps> = ({ status }) => {
  const option = OrderStatusOptions[status as OrderStatus]
  return <StatusBadge label={option?.label ?? status} color={option?.color ?? 'gray'} />
}
