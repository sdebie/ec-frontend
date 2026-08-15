import { describe, it, expect } from 'vitest'

import { defaultRestockForStatus } from '../confirmedActions'
import { OrderStatus } from '@/shared/types/enums/OrderStatus'

/**
 * Mirrors `OrderStatusEn.isPreDispatch()` on the backend. Pinned per status because a
 * wrong default here silently overstates sellable stock: it pre-ticks "return these
 * items to stock" for goods that already left, and a staff member confirming a dialog
 * is unlikely to catch it.
 */
describe('defaultRestockForStatus', () => {
  it.each([
    [OrderStatus.CREATED, true],
    [OrderStatus.PENDING, true],
    [OrderStatus.PAID, true],
    [OrderStatus.IN_STORE_PAYMENT, true],
    [OrderStatus.IN_TRANSIT, false],
    [OrderStatus.DELIVERED, false],
    [OrderStatus.CANCELLED, false],
    [OrderStatus.FAILED, false],
    [OrderStatus.SYSTEM_CANCELED, false],
    [OrderStatus.REFUNDED, false],
  ])('defaults %s to %s', (status, expected) => {
    expect(defaultRestockForStatus(status)).toBe(expected)
  })

  it('covers every status the enum defines, so a new one cannot inherit a default silently', () => {
    const covered = [
      OrderStatus.CREATED,
      OrderStatus.PENDING,
      OrderStatus.PAID,
      OrderStatus.IN_STORE_PAYMENT,
      OrderStatus.IN_TRANSIT,
      OrderStatus.DELIVERED,
      OrderStatus.CANCELLED,
      OrderStatus.FAILED,
      OrderStatus.SYSTEM_CANCELED,
      OrderStatus.REFUNDED,
    ]
    expect(new Set(covered)).toEqual(new Set(Object.values(OrderStatus)))
  })

  it('never defaults a dispatched order to returning stock', () => {
    expect(defaultRestockForStatus(OrderStatus.IN_TRANSIT)).toBe(false)
    expect(defaultRestockForStatus(OrderStatus.DELIVERED)).toBe(false)
  })
})
