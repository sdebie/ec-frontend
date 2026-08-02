import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useViewPreference } from '../useViewPreference'

const STORAGE_KEY = 'catalog-view-preference'

describe('useViewPreference', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('defaults to grid when localStorage is empty', () => {
    const { result } = renderHook(() => useViewPreference())
    expect(result.current[0]).toBe('grid')
  })

  it('reads stored preference from localStorage', () => {
    localStorage.setItem(STORAGE_KEY, 'list')
    const { result } = renderHook(() => useViewPreference())
    expect(result.current[0]).toBe('list')
  })

  it('defaults to grid when stored value is invalid', () => {
    localStorage.setItem(STORAGE_KEY, 'invalid-value')
    const { result } = renderHook(() => useViewPreference())
    expect(result.current[0]).toBe('grid')
  })

  it('persists to localStorage when setView is called', () => {
    const { result } = renderHook(() => useViewPreference())

    act(() => {
      result.current[1]('list')
    })

    expect(result.current[0]).toBe('list')
    expect(localStorage.getItem(STORAGE_KEY)).toBe('list')
  })

  it('persists grid preference back to localStorage', () => {
    localStorage.setItem(STORAGE_KEY, 'list')
    const { result } = renderHook(() => useViewPreference())

    act(() => {
      result.current[1]('grid')
    })

    expect(result.current[0]).toBe('grid')
    expect(localStorage.getItem(STORAGE_KEY)).toBe('grid')
  })

  it('isolates storage keys — writing to one does not affect the other', () => {
    const SECOND_KEY = 'wishlist-view-preference'

    const { result: catalogHook } = renderHook(() => useViewPreference())
    const { result: wishlistHook } = renderHook(() => useViewPreference(SECOND_KEY))

    // Both start at grid (default)
    expect(catalogHook.current[0]).toBe('grid')
    expect(wishlistHook.current[0]).toBe('grid')

    // Write 'list' to the wishlist key
    act(() => {
      wishlistHook.current[1]('list')
    })

    // Wishlist preference changed
    expect(wishlistHook.current[0]).toBe('list')
    expect(localStorage.getItem(SECOND_KEY)).toBe('list')

    // Catalog preference unchanged
    expect(catalogHook.current[0]).toBe('grid')
    expect(localStorage.getItem(STORAGE_KEY)).toBe(null)

    // Write 'list' to catalog key
    act(() => {
      catalogHook.current[1]('list')
    })

    expect(catalogHook.current[0]).toBe('list')
    expect(localStorage.getItem(STORAGE_KEY)).toBe('list')

    // Wishlist still 'list', not affected by catalog write
    expect(wishlistHook.current[0]).toBe('list')
    expect(localStorage.getItem(SECOND_KEY)).toBe('list')
  })
})
