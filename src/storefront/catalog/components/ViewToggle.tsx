import { LayoutGrid, List } from 'lucide-react'
import type { ViewMode } from '../hooks/useViewPreference'

interface ViewToggleProps {
  view: ViewMode
  onViewChange: (mode: ViewMode) => void
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="inline-flex rounded-md border border-(--sf-border) overflow-hidden" role="group">
      <button
        type="button"
        onClick={() => onViewChange('grid')}
        aria-label="Grid view"
        aria-pressed={view === 'grid'}
        className={`inline-flex items-center justify-center p-2 transition-colors ${
          view === 'grid'
            ? 'bg-(--sf-accent) text-(--sf-accent-text)'
            : 'bg-(--sf-panel) text-(--sf-muted-text) hover:bg-(--sf-surface-muted)'
        }`}
      >
        <LayoutGrid className="h-4 w-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={() => onViewChange('list')}
        aria-label="List view"
        aria-pressed={view === 'list'}
        className={`inline-flex items-center justify-center p-2 transition-colors ${
          view === 'list'
            ? 'bg-(--sf-accent) text-(--sf-accent-text)'
            : 'bg-(--sf-panel) text-(--sf-muted-text) hover:bg-(--sf-surface-muted)'
        }`}
      >
        <List className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  )
}
