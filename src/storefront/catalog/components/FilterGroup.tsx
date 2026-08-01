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
        className="flex w-full items-center justify-between py-2 text-sm font-medium text-(--sf-text) hover:text-(--sf-text-hover) transition-colors"
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
