import { Check, ChevronDown, Search, X } from 'lucide-react'
import * as React from 'react'
import { Label } from './Label'
import { cn } from '@/shared/utils/cn'

export interface MultiSelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface MultiSelectProps {
  options: MultiSelectOption[]
  value?: string[]
  onChange?: (value: string[]) => void
  label?: string
  placeholder?: string
  helperText?: React.ReactNode
  error?: React.ReactNode
  disabled?: boolean
  required?: boolean
  className?: string
}

export const MultiSelect = React.forwardRef<HTMLDivElement, MultiSelectProps>(
  (
    {
      options,
      value = [],
      onChange,
      label,
      placeholder = 'Select options',
      helperText,
      error,
      disabled,
      required,
      className,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = React.useState(false)
    const [query, setQuery] = React.useState('')
    const [highlightedIndex, setHighlightedIndex] = React.useState(-1)
    const containerRef = React.useRef<HTMLDivElement>(null)
    const triggerRef = React.useRef<HTMLButtonElement>(null)
    const searchInputRef = React.useRef<HTMLInputElement>(null)
    const listRef = React.useRef<HTMLUListElement>(null)
    const generatedId = React.useId()
    const hasError = !!error

    const selectedOptions = React.useMemo(
      () => options.filter((opt) => value.includes(opt.value)),
      [options, value]
    )

    // Typing filters by label — case-insensitive substring, same rule as SearchableSelect.
    const filteredOptions = React.useMemo(() => {
      const normalizedQuery = query.trim().toLowerCase()
      if (!normalizedQuery) return options
      return options.filter((option) =>
        option.label.toLowerCase().includes(normalizedQuery)
      )
    }, [options, query])

    const closeMenu = React.useCallback((shouldRestoreFocus = false) => {
      setIsOpen(false)
      setQuery('')
      setHighlightedIndex(-1)
      if (shouldRestoreFocus) {
        requestAnimationFrame(() => triggerRef.current?.focus())
      }
    }, [])

    React.useEffect(() => {
      const handleOutsideClick = (event: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target as Node)
        ) {
          closeMenu(false)
        }
      }

      if (isOpen) {
        document.addEventListener('mousedown', handleOutsideClick)
      }
      return () => document.removeEventListener('mousedown', handleOutsideClick)
    }, [isOpen, closeMenu])

    React.useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape' && isOpen) {
          closeMenu(true)
        }
      }
      if (isOpen) {
        document.addEventListener('keydown', handleKeyDown)
      }
      return () => document.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, closeMenu])

    // Auto-focus the search box the instant the panel opens, so the very next
    // keystroke — regardless of what opened it (click, Enter, Space) — filters.
    React.useEffect(() => {
      if (!isOpen) return
      searchInputRef.current?.focus()
    }, [isOpen])

    // Re-anchor the keyboard highlight to the top of whatever the current
    // filter yields, whenever the panel opens or the query narrows the list.
    React.useEffect(() => {
      if (!isOpen) return
      const firstEnabledIndex = filteredOptions.findIndex(
        (option) => !option.disabled
      )
      setHighlightedIndex(firstEnabledIndex)
    }, [isOpen, filteredOptions])

    React.useEffect(() => {
      if (!isOpen || !listRef.current) return
      const element = listRef.current.querySelector<HTMLElement>(
        `[data-option-index="${highlightedIndex}"]`
      )
      element?.scrollIntoView?.({ block: 'nearest' })
    }, [highlightedIndex, isOpen])

    const getNextEnabledIndex = React.useCallback(
      (start: number, direction: 1 | -1) => {
        if (filteredOptions.length === 0) return -1

        let index = start
        for (let step = 0; step < filteredOptions.length; step += 1) {
          index =
            (index + direction + filteredOptions.length) %
            filteredOptions.length
          if (!filteredOptions[index]?.disabled) {
            return index
          }
        }

        return -1
      },
      [filteredOptions]
    )

    const handleToggle = (optionValue: string, optionDisabled?: boolean) => {
      if (optionDisabled || disabled) return

      const newValue = value.includes(optionValue)
        ? value.filter((v) => v !== optionValue)
        : [...value, optionValue]

      onChange?.(newValue)
    }

    const handleRemove = (optionValue: string, e: React.SyntheticEvent) => {
      e.stopPropagation()
      if (!disabled) {
        onChange?.(value.filter((v) => v !== optionValue))
      }
    }

    const handleRemoveKeyDown = (
      optionValue: string,
      e: React.KeyboardEvent
    ) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        handleRemove(optionValue, e)
      }
    }

    const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
        closeMenu(true)
        return
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault()
        setHighlightedIndex((prev) => getNextEnabledIndex(prev, 1))
        return
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault()
        setHighlightedIndex((prev) => getNextEnabledIndex(prev, -1))
        return
      }

      if (event.key === 'Enter') {
        event.preventDefault()
        const highlighted = filteredOptions[highlightedIndex]
        if (highlighted) handleToggle(highlighted.value, highlighted.disabled)
      }
    }

    return (
      <>
        {label && (
          <Label htmlFor={generatedId} required={required}>
            {label}
          </Label>
        )}
        <div
          className={cn('relative', className)}
          ref={(node) => {
            containerRef.current = node
            if (typeof ref === 'function') ref(node)
            else if (ref) ref.current = node
          }}
          {...props}
        >
          <button
            ref={triggerRef}
            id={generatedId}
            type="button"
            disabled={disabled}
            onClick={() => {
              if (disabled) return
              if (isOpen) {
                closeMenu(false)
              } else {
                setIsOpen(true)
              }
            }}
            className={cn(
              'flex min-h-10 w-full items-center justify-between rounded-md border-2 border-(--c-border) bg-(--c-panel) px-3 py-2 text-sm text-(--c-text) transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-(--c-ring) focus:border-transparent focus:ring-offset-1 focus:ring-offset-(--c-bg)',
              'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-(--c-bg)',
              hasError && 'border-(--c-error) focus:ring-(--c-error)'
            )}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
          >
            <div className="flex flex-wrap gap-1 flex-1 min-w-0">
              {selectedOptions.length > 0 ? (
                selectedOptions.map((option) => (
                  <span
                    key={option.value}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-(--c-accent)/10 text-(--c-accent) text-xs font-medium"
                  >
                    {option.label}
                    {!disabled && (
                      <span
                        role="button"
                        tabIndex={0}
                        aria-label={`Remove ${option.label}`}
                        onClick={(e) => handleRemove(option.value, e)}
                        onKeyDown={(e) => handleRemoveKeyDown(option.value, e)}
                        className="hover:text-(--c-accent)/70"
                      >
                        <X className="w-3 h-3" />
                      </span>
                    )}
                  </span>
                ))
              ) : (
                <span className="text-(--c-text-muted)">{placeholder}</span>
              )}
            </div>
            <ChevronDown
              className={cn(
                'h-4 w-4 opacity-50 transition-transform ml-2 shrink-0',
                isOpen && 'rotate-180'
              )}
            />
          </button>

          {isOpen && (
            <div className="absolute z-100 mt-1 w-full overflow-hidden rounded-md border border-(--c-border) bg-(--c-panel) shadow-md text-sm">
              <div className="p-2 border-b border-(--c-border)">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-(--c-text-muted) pointer-events-none" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    placeholder="Search..."
                    className="flex h-9 w-full rounded-md border border-(--c-border) bg-(--c-bg) pl-9 pr-3 text-sm text-(--c-text) placeholder:text-(--c-text-muted) focus:outline-none focus:ring-2 focus:ring-(--c-ring)"
                  />
                </div>
              </div>
              <ul
                ref={listRef}
                role="listbox"
                className="max-h-60 overflow-auto py-1 outline-none"
              >
                {filteredOptions.map((option, index) => {
                  const isSelected = value.includes(option.value)
                  const isDisabled = option.disabled
                  const isHighlighted = index === highlightedIndex

                  return (
                    <li
                      key={option.value}
                      role="option"
                      aria-selected={isSelected}
                      data-option-index={index}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      onClick={() => handleToggle(option.value, option.disabled)}
                      className={cn(
                        'relative flex w-full cursor-pointer select-none items-center justify-between py-2 px-3 outline-none',
                        isDisabled
                          ? 'opacity-50 cursor-not-allowed text-(--c-text-muted)'
                          : 'text-(--c-text) hover:bg-(--c-surface-hover)',
                        isHighlighted &&
                          !isDisabled &&
                          'bg-(--c-surface-hover)',
                        isSelected &&
                          'bg-(--c-accent)/10 text-(--c-accent) font-medium'
                      )}
                    >
                      <span className="truncate block">{option.label}</span>
                      {isSelected && (
                        <Check className="w-4 h-4 shrink-0 ml-2" />
                      )}
                    </li>
                  )
                })}
                {filteredOptions.length === 0 && (
                  <li className="py-2 px-3 text-(--c-text-muted) text-center cursor-default">
                    {options.length === 0
                      ? 'No options available'
                      : 'No options match your search'}
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
        {hasError && error && (
          <p className="text-sm text-(--c-error) mt-1">{error}</p>
        )}
        {!hasError && helperText && (
          <p className="text-sm text-(--c-text-muted) mt-1">{helperText}</p>
        )}
      </>
    )
  }
)
MultiSelect.displayName = 'MultiSelect'
