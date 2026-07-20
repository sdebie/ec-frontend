import { describe, it, expect, beforeEach } from 'vitest'
import * as fc from 'fast-check'
import { useToastStore } from '../toastStore'
import type { ToastVariant } from '../toastStore'

/**
 * Property 7: Toast queue max-5 invariant
 *
 * For any sequence of N toast additions where N > 5, the toast store SHALL never
 * contain more than 5 toasts simultaneously, and the oldest toast SHALL always be
 * evicted first when the limit is reached.
 *
 * **Validates: Requirements 5.3**
 */

const variantArb: fc.Arbitrary<ToastVariant> = fc.constantFrom(
  'success',
  'error',
  'warning',
  'info',
)

describe('Toast queue max-5 invariant — Property 7', () => {
  beforeEach(() => {
    useToastStore.setState({ toasts: [] })
  })

  it('store never exceeds 5 toasts for any sequence of N > 5 additions with unique messages', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 6, max: 50 }),
        fc.array(variantArb, { minLength: 50, maxLength: 50 }),
        (n, variants) => {
          useToastStore.setState({ toasts: [] })

          for (let i = 0; i < n; i++) {
            useToastStore.getState().add({
              variant: variants[i % variants.length],
              // Each message is unique by index to avoid deduplication
              message: `toast-message-${i}`,
              duration: 4000,
            })

            // Invariant: after every addition, the store never exceeds 5 toasts
            const currentLength = useToastStore.getState().toasts.length
            expect(currentLength).toBeLessThanOrEqual(5)
          }
        },
      ),
      { numRuns: 100 },
    )
  })

  it('oldest toast is evicted first when the queue is full', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 6, max: 30 }),
        (n) => {
          useToastStore.setState({ toasts: [] })

          // Add N toasts with unique messages, using index as identifier
          for (let i = 0; i < n; i++) {
            useToastStore.getState().add({
              variant: 'info',
              message: `msg-${i}`,
              duration: 4500,
            })
          }

          const toasts = useToastStore.getState().toasts

          // Store has at most 5 toasts
          expect(toasts).toHaveLength(5)

          // The most recent 5 toasts should be kept (indices n-5 through n-1)
          const expectedMessages = Array.from({ length: 5 }, (_, idx) => `msg-${n - 5 + idx}`)
          const actualMessages = toasts.map((t) => t.message)

          expect(actualMessages).toEqual(expectedMessages)
        },
      ),
      { numRuns: 100 },
    )
  })

  it('max-5 invariant holds regardless of toast variant mix', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            variant: variantArb,
            index: fc.nat(),
          }),
          { minLength: 6, maxLength: 40 },
        ),
        (toastSpecs) => {
          useToastStore.setState({ toasts: [] })

          // Use a globally unique counter to prevent deduplication
          toastSpecs.forEach((spec, i) => {
            useToastStore.getState().add({
              variant: spec.variant,
              message: `unique-${i}-${spec.index}`,
              duration: spec.variant === 'error' ? 0 : 4000,
            })

            // Invariant must hold after every single addition
            expect(useToastStore.getState().toasts.length).toBeLessThanOrEqual(5)
          })

          // Final state must have exactly min(toastSpecs.length, 5) toasts
          const finalLength = useToastStore.getState().toasts.length
          expect(finalLength).toBe(Math.min(toastSpecs.length, 5))
        },
      ),
      { numRuns: 100 },
    )
  })
})
