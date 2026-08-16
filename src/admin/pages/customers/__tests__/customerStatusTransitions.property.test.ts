import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { getAvailableActions, type CustomerStatus } from '@/admin/pages/customers/types'

/**
 * Feature: admin-customer-management
 * Property 1: Status transition table correctness
 *
 * For any valid CustomerStatus, getAvailableActions SHALL return exactly the
 * set of actions permitted by the transition table — PENDING yields ['activate'],
 * ACTIVE yields ['suspend'], DISABLED yields ['activate'] — and no status SHALL
 * ever yield both 'activate' and 'suspend' simultaneously.
 *
 */

// Arbitrary that generates valid CustomerStatus values
const customerStatusArb: fc.Arbitrary<CustomerStatus> = fc.constantFrom(
  'PENDING' as const,
  'ACTIVE' as const,
  'DISABLED' as const,
)

// Expected transitions lookup
const expectedTransitions: Record<CustomerStatus, Array<'activate' | 'suspend'>> = {
  PENDING: ['activate'],
  ACTIVE: ['suspend'],
  DISABLED: ['activate'],
}

describe('Customer status transitions — Property Tests', () => {
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

  it('PENDING → [activate], ACTIVE → [suspend], DISABLED → [activate]', () => {
    fc.assert(
      fc.property(customerStatusArb, (status) => {
        const actions = getAvailableActions(status)

        switch (status) {
          case 'PENDING':
            expect(actions).toEqual(['activate'])
            break
          case 'ACTIVE':
            expect(actions).toEqual(['suspend'])
            break
          case 'DISABLED':
            expect(actions).toEqual(['activate'])
            break
        }
      }),
      { numRuns: 100 },
    )
  })
})
