import { describe, it, expect, afterEach } from 'vitest'
import * as fc from 'fast-check'
import { render, cleanup } from '@testing-library/react'
import { OrderStatusDisplay } from '@/shared/ui/components'
import { OrderStatus, OrderStatusOptions } from '@/shared/types/enums/OrderStatus'

/**
 * Feature: admin-order-management, Property 4: OrderStatusDisplay colour mapping
 *
 * For any admin-relevant OrderStatus value, OrderStatusDisplay SHALL style the badge
 * entirely from theme tokens. No hardcoded Tailwind palette utility may appear in the
 * rendered output — that is the assertion this file exists for, and the one the shared
 * status-display property test does not make.
 */

const adminRelevantStatuses = [
  OrderStatus.PENDING,
  OrderStatus.PAID,
  OrderStatus.IN_STORE_PAYMENT,
  OrderStatus.IN_TRANSIT,
  OrderStatus.DELIVERED,
  OrderStatus.CANCELLED,
  OrderStatus.REFUNDED,
] as const

/**
 * Tailwind palette utilities, which a themed component must never carry: a literal colour
 * cannot follow a preset and is wrong in whichever theme it was not authored against.
 * Matches `bg-red-500`, `text-gray-700`, `border-indigo-200`, `bg-white`, and the `dark:`
 * variants of each.
 */
const HARDCODED_PALETTE =
  /(?:^|\s|:)(?:bg|text|border|ring|fill|stroke)-(?:white|black|slate|gray|grey|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)(?:-\d{2,3})?(?:\/\d+)?(?:\s|$)/

const adminOrderStatusArb = fc.constantFrom(...adminRelevantStatuses)

describe('Feature: admin-order-management, Property 4: OrderStatusDisplay colour mapping', () => {
  afterEach(() => {
    cleanup()
  })

  it('styles every admin-relevant status from tokens alone, with no hardcoded palette class', () => {
    fc.assert(
      fc.property(adminOrderStatusArb, (status) => {
        const { unmount, container } = render(<OrderStatusDisplay status={status} />)

        const badge = container.querySelector<HTMLElement>('[data-testid="status-badge"]')
        expect(badge).not.toBeNull()
        expect(badge!.textContent).toBe(OrderStatusOptions[status].label)
        expect(badge!.className).not.toMatch(HARDCODED_PALETTE)
        expect(badge!.className).not.toContain('dark:')

        unmount()
      }),
      { numRuns: 100 },
    )
  })
})
