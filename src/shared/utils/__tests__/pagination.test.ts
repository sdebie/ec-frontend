import { describe, it, expect } from 'vitest'

import { clampItemRange } from '../pagination'

describe('clampItemRange', () => {
  it('computes the normal start/end for a page fully within the total', () => {
    expect(clampItemRange(2, 20, 100)).toEqual({ start: 21, end: 40 })
  })

  it('clamps end to totalItems on the last, partially-filled page', () => {
    expect(clampItemRange(3, 20, 50)).toEqual({ start: 41, end: 50 })
  })

  it('clamps start when currentPage is stale relative to a shrunk total', () => {
    // Unclamped this would be (2-1)*10+1 = 11, exceeding a totalItems of 10.
    expect(clampItemRange(2, 10, 10)).toEqual({ start: 10, end: 10 })
  })

  it('returns a zero range when totalItems is zero', () => {
    expect(clampItemRange(1, 10, 0)).toEqual({ start: 0, end: 0 })
  })
})
