import { useState, useCallback } from 'react'

export type ViewMode = 'grid' | 'list'

const STORAGE_KEY = 'catalog-view-preference'

function readStoredPreference(): ViewMode {
  if (typeof window === 'undefined') return 'grid'
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'grid' || stored === 'list') return stored
  } catch {
    // localStorage unavailable or blocked — fall back silently
  }
  return 'grid'
}

/**
 * Persists the user's grid/list view preference in localStorage.
 * Defaults to 'grid' when no value is stored or the stored value is invalid.
 */
export function useViewPreference(): [ViewMode, (mode: ViewMode) => void] {
  const [view, setViewState] = useState<ViewMode>(readStoredPreference)

  const setView = useCallback((mode: ViewMode) => {
    setViewState(mode)
    try {
      localStorage.setItem(STORAGE_KEY, mode)
    } catch {
      // localStorage full or unavailable — preference won't persist
    }
  }, [])

  return [view, setView]
}
