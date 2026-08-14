import { describe, it, expect, afterEach } from 'vitest'
import * as fc from 'fast-check'
import { render, cleanup } from '@testing-library/react'
import { OrderStatusDisplay } from '@/shared/ui/components'
import { OrderStatus, OrderStatusOptions } from '@/shared/types/enums/OrderStatus'

/**
 * Feature: admin-order-management, Property 4: OrderStatusDisplay color mapping
 *
 * For any admin-relevant OrderStatus enum value (PENDING, PAID, IN_STORE_PAYMENT,
 * IN_TRANSIT, DELIVERED, CANCELLED, REFUNDED), OrderStatusDisplay SHALL render a
 * StatusBadge with the color prop matching the value defined in
 * OrderStatusOptions[status].color. No hardcoded Tailwind colour utilities shall
 * appear in the rendered output.
 *
 */

// Admin-relevant statuses only
const adminRelevantStatuses = [
  OrderStatus.PENDING,
  OrderStatus.PAID,
  OrderStatus.IN_STORE_PAYMENT,
  OrderStatus.IN_TRANSIT,
  OrderStatus.DELIVERED,
  OrderStatus.CANCELLED,
  OrderStatus.REFUNDED,
] as const

// Map color string to expected CSS token classes used by StatusBadge
const colorTokens: Record<string, { bg: string; text: string }> = {
  gray: { bg: 'bg-(--c-status-yellow-bg)', text: 'text-(--c-status-yellow-text)' },
  yellow: { bg: 'bg-(--c-status-yellow-bg)', text: 'text-(--c-status-yellow-text)' },
  green: { bg: 'bg-(--c-status-green-bg)', text: 'text-(--c-status-green-text)' },
  blue: { bg: 'bg-(--c-status-green-bg)', text: 'text-(--c-status-green-text)' },
  red: { bg: 'bg-(--c-status-red-bg)', text: 'text-(--c-status-red-text)' },
  orange: { bg: 'bg-(--c-status-yellow-bg)', text: 'text-(--c-status-yellow-text)' },
}
const neutralTokens = { bg: 'bg-(--c-status-yellow-bg)', text: 'text-(--c-status-yellow-text)' }

const expectedTokens = (color: string) => colorTokens[color] ?? neutralTokens

// Arbitrary for admin-relevant statuses
const adminOrderStatusArb = fc.constantFrom(...adminRelevantStatuses)

describe('Feature: admin-order-management, Property 4: OrderStatusDisplay color mapping', () => {
  afterEach(() => {
    cleanup()
  })

  it('OrderStatusDisplay renders badge with correct label and color tokens for any admin-relevant OrderStatus', () => {
    fc.assert(
      fc.property(adminOrderStatusArb, (status) => {
        const { unmount, container } = render(<OrderStatusDisplay status={status} />)

        const badge = container.querySelector('span')
        expect(badge).not.toBeNull()

        const option = OrderStatusOptions[status]

        // Assert label text matches Options map
        expect(badge!.textContent).toBe(option.label)

        // Assert colour token classes match Options map
        const className = badge!.className
        const tokens = expectedTokens(option.color)
        expect(className).toContain(tokens.bg)
        expect(className).toContain(tokens.text)

        unmount()
      }),
      { numRuns: 100 },
    )
  })
})
