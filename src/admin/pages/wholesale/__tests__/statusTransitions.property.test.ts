import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { getAvailableActions, type CustomerStatus } from '@/admin/hooks/customers/types'

/**
 * Feature: admin-wholesale-management
 * Property 3: Status transition table correctness
 *
 * For any valid CustomerStatus, getAvailableActions SHALL return exactly:
 * PENDING → ['activate'], ACTIVE → ['suspend'], DISABLED → ['activate']
 *
 * **Validates: Requirements 4.1**
 */

const customerStatusArb: fc.Arbitrary<CustomerStatus> = fc.constantFrom(
  'PENDING' as const,
  'ACTIVE' as const,
  'DISABLED' as const,
)

const expectedTransitions: Record<CustomerStatus, Array<'activate' | 'suspend'>> = {
  PENDING: ['activate'],
  ACTIVE: ['suspend'],
  DISABLED: ['activate'],
}

describe('Feature: admin-wholesale-management, Property 3: Status transition table correctness', () => {
  it('getAvailableActions returns exactly the permitted actions for each status', () => {
    fc.assert(
      fc.property(customerStatusArb, (status) => {
        const actions = getAvailableActions(status)
        const expected = expectedTransitions[status]
        expect(actions).toEqual(expected)
      }),
      { numRuns: 100 },
    )
  })

  it('no status ever returns both activate and suspend simultaneously', () => {
    fc.assert(
      fc.property(customerStatusArb, (status) => {
        const actions = getAvailableActions(status)
        const hasActivate = actions.includes('activate')
        const hasSuspend = actions.includes('suspend')
        expect(hasActivate && hasSuspend).toBe(false)
      }),
      { numRuns: 100 },
    )
  })
})
