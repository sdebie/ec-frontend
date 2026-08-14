// Feature: admin-product-import, Property 1: Batch status color mapping is total and correct

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { getBatchStatusColor } from '../utils'
import type { BatchStatus } from '../types'

describe('getBatchStatusColor — Property Tests', () => {
  it('maps every BatchStatus to the correct color with no undefined return', () => {
    fc.assert(
      fc.property(
        fc.constantFrom<BatchStatus>('IMPORTING', 'PENDING', 'PROCESSING', 'PROCESSED', 'FAILED'),
        (status) => {
          const result = getBatchStatusColor(status)

          // Verify no undefined return for any valid enum member
          expect(result).toBeDefined()
          expect(typeof result).toBe('string')

          // Verify correct mapping
          if (status === 'IMPORTING' || status === 'PENDING' || status === 'PROCESSING') {
            expect(result).toBe('yellow')
          } else if (status === 'PROCESSED') {
            expect(result).toBe('green')
          } else if (status === 'FAILED') {
            expect(result).toBe('red')
          }
        },
      ),
      { numRuns: 100 },
    )
  })
})
