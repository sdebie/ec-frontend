import { describe, it, expect, afterEach } from 'vitest'
import * as fc from 'fast-check'
import { render, cleanup } from '@testing-library/react'
import { OrderStatusDisplay } from '../OrderStatusDisplay'
import { ProductStatusDisplay } from '../ProductStatusDisplay'
import { OrderStatus, OrderStatusOptions } from '@/shared/types/enums/OrderStatus'
import { ProductStatus, ProductStatusOptions } from '@/shared/types/enums/ProductStatus'

/**
 * Property 9: Status display renders correct badge
 *
 * For any enum value from OrderStatus or ProductStatus, the corresponding
 * StatusDisplay component SHALL render a badge whose label and color match
 * the entry in the respective Options map.
 *
 */

const orderStatusValues = Object.values(OrderStatus)
const productStatusValues = Object.values(ProductStatus)

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

// Arbitraries for every enum value
const orderStatusArb = fc.constantFrom(...orderStatusValues)
const productStatusArb = fc.constantFrom(...productStatusValues)

describe('Status display renders correct badge — Property Tests', () => {
  afterEach(() => {
    cleanup()
  })

  it('OrderStatusDisplay renders badge with correct label and colour for any OrderStatus value', () => {
    fc.assert(
      fc.property(orderStatusArb, (status) => {
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

  it('ProductStatusDisplay renders badge with correct label and colour for any ProductStatus value', () => {
    fc.assert(
      fc.property(productStatusArb, (status) => {
        const { unmount, container } = render(<ProductStatusDisplay status={status} />)

        const badge = container.querySelector('span')
        expect(badge).not.toBeNull()

        const option = ProductStatusOptions[status]
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
