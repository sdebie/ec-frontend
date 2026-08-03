import { useState, useCallback } from 'react'

export type ViewMode = 'grid' | 'list'

function readStoredPreference(key: string): ViewMode {
  if (typeof window === 'undefined') return 'grid'
  try {
    const stored = localStorage.getItem(key)
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
export function useViewPreference(
  storageKey: string = 'catalog-view-preference',
): [ViewMode, (mode: ViewMode) => void] {
  const [view, setViewState] = useState<ViewMode>(() => readStoredPreference(storageKey))

  const setView = useCallback((mode: ViewMode) => {
    setViewState(mode)
    try {
      localStorage.setItem(storageKey, mode)
    } catch {
      // localStorage full or unavailable — preference won't persist
    }
  }, [storageKey])

  return [view, setView]
}
