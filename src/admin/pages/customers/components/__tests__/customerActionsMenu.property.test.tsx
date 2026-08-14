import { describe, it, expect, vi } from 'vitest'
import * as fc from 'fast-check'
import { render, screen, fireEvent } from '@testing-library/react'
import { CustomerActionsMenu } from '../CustomerActionsMenu'
import type { CustomerStatus, AdminCustomerSummary } from '@/admin/hooks/customers/types'

/**
 * Feature: admin-customer-management
 * Property: CustomerActionsMenu available actions
 *
 * For any valid CustomerStatus, rendering the CustomerActionsMenu with a customer
 * of that status SHALL display only the correct action labels:
 *   - PENDING → 'Activate' appears, 'Suspend' does NOT appear
 *   - ACTIVE → 'Suspend' appears, 'Activate' does NOT appear
 *   - DISABLED → 'Activate' appears, 'Suspend' does NOT appear
 *
 */

const customerStatusArb: fc.Arbitrary<CustomerStatus> = fc.constantFrom(
  'PENDING' as const,
  'ACTIVE' as const,
  'DISABLED' as const,
)

function buildCustomer(status: CustomerStatus): AdminCustomerSummary {
  return {
    id: 'test-id',
    firstName: 'Test',
    lastName: 'Customer',
    email: 'test@example.com',
    shopperType: 'RETAILER',
    status,
    registeredAt: '2024-01-01T00:00:00Z',
  }
}

// Expected actions per status
const expectedActions: Record<CustomerStatus, { activate: boolean; suspend: boolean }> = {
  PENDING: { activate: true, suspend: false },
  ACTIVE: { activate: false, suspend: true },
  DISABLED: { activate: true, suspend: false },
}

describe('CustomerActionsMenu available actions — Property Tests', () => {
  it('renders only the correct action labels for each customer status', () => {
    fc.assert(
      fc.property(customerStatusArb, (status) => {
        const customer = buildCustomer(status)
        const onActivate = vi.fn()
        const onSuspend = vi.fn()

        const { unmount } = render(
          <CustomerActionsMenu
            customer={customer}
            onActivate={onActivate}
            onSuspend={onSuspend}
          />,
        )

        // Open the dropdown menu by clicking the trigger button
        const trigger = screen.getByTestId('customer-actions-menu').querySelector('button')!
        fireEvent.click(trigger)

        const expected = expectedActions[status]

        if (expected.activate) {
          expect(screen.getByTestId('action-activate')).toBeInTheDocument()
        } else {
          expect(screen.queryByTestId('action-activate')).not.toBeInTheDocument()
        }

        if (expected.suspend) {
          expect(screen.getByTestId('action-suspend')).toBeInTheDocument()
        } else {
          expect(screen.queryByTestId('action-suspend')).not.toBeInTheDocument()
        }

        unmount()
      }),
      { numRuns: 100 },
    )
  })
})
