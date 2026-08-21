import { ChevronsLeft, ChevronsRight } from 'lucide-react'

export interface NavToggleProps {
  toggled: boolean
  onToggle: () => void
}

export function NavToggle({ toggled, onToggle }: NavToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="p-2 rounded-(--c-radius) text-admin-text-muted hover:bg-admin-sidebar-hover hover:text-admin-text transition-colors"
      title={toggled ? 'Expand sidebar' : 'Collapse sidebar'}
    >
      {toggled ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
    </button>
  )
}
