import { describe, it, expect, beforeEach } from 'vitest'
import * as fc from 'fast-check'
import { toast, useToastStore } from '../toastStore'
import type { ToastVariant } from '../toastStore'

/**
 * Property 8: Toast deduplication
 *
 * For any variant + message combination, calling the imperative toast API twice
 * with the same variant and message while both are currently visible in the stack
 * SHALL result in the store containing exactly one toast with that combination.
 *
 */

const variantArb = fc.constantFrom<ToastVariant>('success', 'error', 'warning', 'info')
const messageArb = fc.string({ minLength: 1 })

describe('Toast Deduplication — Property Tests', () => {
  beforeEach(() => {
    useToastStore.setState({ toasts: [] })
  })

  it('calling the imperative toast API twice with the same variant+message results in exactly one toast', () => {
    fc.assert(
      fc.property(variantArb, messageArb, (variant, message) => {
        // Reset store state between each generated case
        useToastStore.setState({ toasts: [] })

        // Call the imperative API twice with the same variant and message
        toast[variant](message)
        toast[variant](message)

        // Assert: store contains exactly one toast with that variant+message combination
        const toasts = useToastStore.getState().toasts
        const matching = toasts.filter(
          (t) => t.variant === variant && t.message === message,
        )

        expect(matching).toHaveLength(1)
      }),
      { numRuns: 100 },
    )
  })
})
