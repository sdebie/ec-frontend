import { describe, it, expect } from 'vitest'

import { defaultRestockForStatus } from '../confirmedActions'
import { getAvailableTransitions } from '../getAvailableTransitions'
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

  /**
   * The drift tripwire for a rule that exists in two languages.
   *
   * "Pre-dispatch" and "may be cancelled" are the same set of statuses, and not by
   * accident: cancellation restores stock unconditionally, which is only sound while
   * every cancellable status still holds its goods. `OrderStatusEnPreDispatchTest`
   * asserts the identical equivalence against `OrderStatusEn`, so each side is pinned
   * to its own transition map and those maps are already mirrored — changing the
   * pre-dispatch rule on one side alone fails here or there.
   *
   * If the two concepts ever genuinely diverge, this test failing is the signal to
   * build a real frontend/backend sync for the default, not to loosen the assertion.
   */
  it('agrees with the transition map: pre-dispatch is exactly where cancellation is offered', () => {
    for (const status of Object.values(OrderStatus)) {
      expect(defaultRestockForStatus(status)).toBe(
        getAvailableTransitions(status).includes(OrderStatus.CANCELLED),
      )
    }
  })
})
