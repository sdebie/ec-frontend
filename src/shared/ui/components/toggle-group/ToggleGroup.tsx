import * as React from 'react'
import { cn } from '@/shared/utils/cn'

export interface ToggleGroupOption {
  value: string
  label: string
  icon?: React.ReactNode
  disabled?: boolean
}

export interface ToggleGroupProps {
  options: ToggleGroupOption[]
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  className?: string
  size?: 'sm' | 'md'
}

/**
 * A pill-shaped switcher for a small set of mutually-exclusive modes — the
 * active option gets a solid accent-filled pill; visually distinct from
 * Segment's underlined-tab look and from Switcher's boolean on/off track.
 */
export const ToggleGroup = React.forwardRef<HTMLDivElement, ToggleGroupProps>(
  ({ options, value, onChange, disabled, className, size = 'md' }, ref) => {
    return (
      <div
        ref={ref}
        role="group"
        className={cn(
          'inline-flex items-center gap-0.5 rounded-full border border-(--c-border) bg-(--c-bg) p-1',
          className
        )}
      >
        {options.map((option) => {
          const isSelected = value === option.value
          const isDisabled = disabled || option.disabled

          return (
            <button
              key={option.value}
              type="button"
              disabled={isDisabled}
              aria-pressed={isSelected}
              onClick={() => !isDisabled && onChange(option.value)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--c-ring) focus-visible:ring-offset-1 focus-visible:ring-offset-(--c-bg)',
                size === 'sm' ? 'px-3 py-1 text-xs' : 'px-4 py-1.5 text-sm',
                isSelected
                  ? 'bg-(--c-accent) text-(--c-accent-text) shadow-(--c-shadow-sm)'
                  : 'text-(--c-text-muted) hover:text-(--c-text)',
                isDisabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              {option.icon}
              {option.label}
            </button>
          )
        })}
      </div>
    )
  }
)
ToggleGroup.displayName = 'ToggleGroup'
