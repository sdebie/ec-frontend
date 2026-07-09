import { describe, it, expect } from 'vitest'
import { getPaginationText, getPageNumbers } from './paginationUtils'

describe('getPaginationText', () => {
  it('returns zeros when total is 0', () => {
    expect(getPaginationText(1, 10, 0)).toBe('Showing 0 to 0 of 0 results')
  })

  it('calculates correct range for first page', () => {
    expect(getPaginationText(1, 10, 55)).toBe('Showing 1 to 10 of 55 results')
  })

  it('calculates correct range for middle page', () => {
    expect(getPaginationText(3, 10, 55)).toBe('Showing 21 to 30 of 55 results')
  })

  it('calculates correct range for last page with partial results', () => {
    expect(getPaginationText(6, 10, 55)).toBe('Showing 51 to 55 of 55 results')
  })

  it('calculates correctly with page size 25', () => {
    expect(getPaginationText(2, 25, 100)).toBe('Showing 26 to 50 of 100 results')
  })

  it('handles single item total', () => {
    expect(getPaginationText(1, 10, 1)).toBe('Showing 1 to 1 of 1 results')
  })

  it('handles page size 50 on page 1', () => {
    expect(getPaginationText(1, 50, 30)).toBe('Showing 1 to 30 of 30 results')
  })
})

describe('getPageNumbers', () => {
  it('returns [1] when totalPages is 1', () => {
    expect(getPageNumbers(1, 1)).toEqual([1])
  })

  it('returns [1, 2] when totalPages is 2 and current is 1', () => {
    expect(getPageNumbers(1, 2)).toEqual([1, 2])
  })

  it('returns [1, 2, 3] when totalPages is 3 and current is 2', () => {
    expect(getPageNumbers(2, 3)).toEqual([1, 2, 3])
  })

  it('shows ellipsis for large gaps', () => {
    // current=5, totalPages=10: should show 1, ..., 4, 5, 6, ..., 10
    expect(getPageNumbers(5, 10)).toEqual([1, '...', 4, 5, 6, '...', 10])
  })

  it('shows no left ellipsis when current is near start', () => {
    // current=2, totalPages=10: should show 1, 2, 3, ..., 10
    expect(getPageNumbers(2, 10)).toEqual([1, 2, 3, '...', 10])
  })

  it('shows no right ellipsis when current is near end', () => {
    // current=9, totalPages=10: should show 1, ..., 8, 9, 10
    expect(getPageNumbers(9, 10)).toEqual([1, '...', 8, 9, 10])
  })

  it('always includes page 1 and last page', () => {
    const result = getPageNumbers(7, 15)
    expect(result[0]).toBe(1)
    expect(result[result.length - 1]).toBe(15)
  })

  it('always includes current page', () => {
    const result = getPageNumbers(8, 20)
    expect(result).toContain(8)
  })

  it('handles current page at page 1', () => {
    expect(getPageNumbers(1, 5)).toEqual([1, 2, '...', 5])
  })

  it('handles current page at last page', () => {
    expect(getPageNumbers(5, 5)).toEqual([1, '...', 4, 5])
  })

  it('handles totalPages of 4 with current at 2', () => {
    // pages: 1, 2, 3, 4 — current is 2 so neighbors are 1 and 3. 
    // Set: 1, 2, 3, 4 — all adjacent so no ellipsis
    expect(getPageNumbers(2, 4)).toEqual([1, 2, 3, 4])
  })

  it('handles totalPages of 5 with current at 3', () => {
    // Set: 1, 2, 3, 4, 5 — all adjacent
    expect(getPageNumbers(3, 5)).toEqual([1, 2, 3, 4, 5])
  })

  it('returns [1] for totalPages <= 0', () => {
    expect(getPageNumbers(1, 0)).toEqual([1])
    expect(getPageNumbers(1, -1)).toEqual([1])
  })
})
