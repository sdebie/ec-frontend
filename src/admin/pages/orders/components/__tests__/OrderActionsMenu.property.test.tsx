import { describe, it, expect, afterEach } from 'vitest'
import * as fc from 'fast-check'
import { render, cleanup } from '@testing-library/react'

import { OrderActionsMenu } from '@/admin/pages/orders/components/OrderActionsMenu'
import { getAvailableTransitions } from '@/admin/pages/orders/utils/getAvailableTransitions'
import { OrderStatus } from '@/shared/types/enums/OrderStatus'
import type { AdminOrderSummary } from '@/admin/pages/orders/types'

/**
 * Feature: admin-order-management
 * Property 2: Actions menu visibility is conjunction of canMutate and available transitions
 *
 * For any combination of canMutate (boolean) and OrderStatus, the actions menu
 * SHALL be rendered if and only if canMutate === true AND
 * getAvailableTransitions(status).length > 0. In all other cases, the menu
 * SHALL not be rendered.
 *
 */

const orderStatusArb = fc.constantFrom(...Object.values(OrderStatus))

const noop = () => {}

function makeMockOrder(status: OrderStatus): AdminOrderSummary {
  return {
    id: 'test-id',
    reference: 'ORD-001',
    customerName: 'Test Customer',
    placedAt: '2024-01-01T00:00:00Z',
    itemCount: 1,
    total: 100,
    status,
  }
}

describe('Actions menu visibility — Property Tests', () => {
  afterEach(() => {
    cleanup()
  })

  it('menu renders if and only if canMutate === true AND getAvailableTransitions(status).length > 0', () => {
    fc.assert(
      fc.property(
        fc.tuple(fc.boolean(), orderStatusArb),
        ([canMutate, status]) => {
          const order = makeMockOrder(status)
          const { container } = render(
            <OrderActionsMenu
              order={order}
              onSelect={noop}
              canMutate={canMutate}
            />,
          )

          const menuElement = container.querySelector('[data-testid="order-actions-menu"]')
          const shouldRender = canMutate && getAvailableTransitions(status).length > 0

          if (shouldRender) {
            expect(menuElement).not.toBeNull()
          } else {
            expect(menuElement).toBeNull()
          }

          cleanup()
        },
      ),
      { numRuns: 100 },
    )
  })
})
