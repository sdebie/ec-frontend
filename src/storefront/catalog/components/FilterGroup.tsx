import { useState, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'

interface FilterGroupProps {
  title: string
  defaultOpen?: boolean
  isActive?: boolean
  children: ReactNode
}

export function FilterGroup({ title, defaultOpen = false, isActive = false, children }: FilterGroupProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen || isActive)

  return (
    <div className="border-b border-(--sf-border) pb-4">
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        // Accent on hover, matching the tree items this group wraps
        // (CategoryTreeFilter uses the same pair). Until 2026-08-04 the hover
        // read a "sf-text-hover" token that exists in no seed and no stylesheet,
        // so the browser dropped the declaration and the header never changed
        // colour at all. The vocabulary has hover tokens for the nav only —
        // see shared/config/themeTokens.ts, which now guards this.
        className="flex w-full items-center justify-between py-2 text-sm font-medium text-(--sf-text) hover:text-(--sf-accent) transition-colors"
      >
        <span>{title}</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>
      {isOpen && (
        <div className="pt-2">
          {children}
        </div>
      )}
    </div>
  )
}
