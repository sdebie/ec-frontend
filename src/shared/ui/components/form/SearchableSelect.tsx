import { Check, ChevronDown, Search, X } from 'lucide-react'
import * as React from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/shared/utils/cn'
import { Input } from '@/shared/ui/primitives'
import { CONTROL_SIZE_CLASSES, type ControlSize } from '@/shared/ui/primitives/controlSize'

export interface SearchableSelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SearchableSelectProps {
  options: SearchableSelectOption[]
  value?: string
  onChange?: (value: string) => void
  /** Applied to the trigger button so a Label's htmlFor (e.g. FormItem's injected id) targets it. */
  id?: string
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  disabled?: boolean
  className?: string
  /** Matches Input's size scale so the trigger can sit flush with a same-size Input. */
  size?: ControlSize
  clearAriaLabel?: string
  usePortal?: boolean
  portalTarget?: HTMLElement | null
  menuZIndex?: number
}

export const SearchableSelect = React.forwardRef<
  HTMLDivElement,
  SearchableSelectProps
>(
  (
    {
      options,
      value,
      onChange,
      id,
      placeholder = 'Select an option',
      searchPlaceholder = 'Search...',
      emptyText = 'No options found',
      disabled,
      className,
      size = 'md',
      clearAriaLabel = 'Clear selection',
      usePortal = true,
      portalTarget,
      menuZIndex = 100,
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = React.useState(false)
    const [query, setQuery] = React.useState('')
    const [highlightedIndex, setHighlightedIndex] = React.useState(-1)
    const [isNavigatingKeyboard, setIsNavigatingKeyboard] =
      React.useState(false)
    const [isHovering, setIsHovering] = React.useState(false)

    const containerRef = React.useRef<HTMLDivElement>(null)
    const triggerRef = React.useRef<HTMLButtonElement>(null)
    const searchInputRef = React.useRef<HTMLInputElement>(null)
    const listRef = React.useRef<HTMLDivElement>(null)
    const menuRef = React.useRef<HTMLDivElement>(null)
    const [portalPosition, setPortalPosition] = React.useState<{
      top: number
      left: number
      width: number
    }>({ top: 0, left: 0, width: 0 })
    const [listMaxHeight, setListMaxHeight] = React.useState(200)
    const [menuPlacement, setMenuPlacement] = React.useState<'top' | 'bottom'>(
      'bottom'
    )
    const [detectedPortalTarget, setDetectedPortalTarget] =
      React.useState<HTMLElement | null>(null)

    // Auto-detect portal target (dialog/modal container) if not explicitly provided
    React.useEffect(() => {
      if (portalTarget || !containerRef.current) return

      let ancestor: HTMLElement | null = containerRef.current
      while (ancestor) {
        const role = ancestor.getAttribute('role')
        const ariaModal = ancestor.getAttribute('aria-modal')
        const dataRole = ancestor.getAttribute('data-radix-dialog-content')

        if (role === 'dialog' || ariaModal === 'true' || dataRole) {
          setDetectedPortalTarget(ancestor)
          return
        }

        ancestor = ancestor.parentElement
      }

      if (typeof document !== 'undefined') {
        setDetectedPortalTarget(document.body)
      }
    }, [portalTarget])

    const selectedOption = React.useMemo(
      () => options.find((opt) => opt.value === value),
      [options, value]
    )

    const filteredOptions = React.useMemo(() => {
      const normalizedQuery = query.trim().toLowerCase()
      if (!normalizedQuery) return options
      return options.filter((option) =>
        option.label.toLowerCase().includes(normalizedQuery)
      )
    }, [options, query])

    React.useEffect(() => {
      if (!isOpen) return
      const handleOutsideClick = (event: MouseEvent) => {
        const target = event.target as Node
        const clickedTriggerArea =
          containerRef.current?.contains(target) ?? false
        const clickedMenu = menuRef.current?.contains(target) ?? false

        if (!clickedTriggerArea && !clickedMenu) {
          setIsOpen(false)
          setQuery('')
        }
      }

      document.addEventListener('mousedown', handleOutsideClick)
      return () => document.removeEventListener('mousedown', handleOutsideClick)
    }, [isOpen])

    // Calculate dropdown positioning and height based on available space
    const calculateDropdownLayout = React.useCallback(() => {
      if (!triggerRef.current) return null

      const viewportMargin = 8
      const dropdownOffset = 4
      const minListHeight = 100
      const preferredListHeight = 200
      const menuChromeHeight = 64
      const rect = triggerRef.current.getBoundingClientRect()

      let dialogBounds = {
        top: 0,
        bottom: window.innerHeight,
      }

      let ancestor: HTMLElement | null = triggerRef.current.parentElement
      while (ancestor) {
        const role = ancestor.getAttribute('role')
        const ariaModal = ancestor.getAttribute('aria-modal')
        const dataRole = ancestor.getAttribute('data-radix-dialog-content')

        if (role === 'dialog' || ariaModal === 'true' || dataRole) {
          const ancestorRect = ancestor.getBoundingClientRect()
          dialogBounds = {
            top: ancestorRect.top + viewportMargin,
            bottom: ancestorRect.bottom - viewportMargin,
          }
          break
        }

        ancestor = ancestor.parentElement
      }

      const spaceBelow = dialogBounds.bottom - rect.bottom - dropdownOffset
      const spaceAbove = rect.top - dialogBounds.top - dropdownOffset

      const shouldOpenUpward =
        spaceBelow < minListHeight && spaceAbove > spaceBelow
      const availableSpace = Math.max(
        shouldOpenUpward ? spaceAbove : spaceBelow,
        minListHeight
      )

      const nextListMaxHeight = Math.min(
        preferredListHeight,
        Math.max(minListHeight, availableSpace - menuChromeHeight)
      )
      const estimatedMenuHeight = nextListMaxHeight + menuChromeHeight

      const rawTop = shouldOpenUpward
        ? rect.top - dropdownOffset - estimatedMenuHeight
        : rect.bottom + dropdownOffset

      const constrainedTop = Math.min(
        Math.max(rawTop, dialogBounds.top),
        dialogBounds.bottom - estimatedMenuHeight
      )

      return {
        placement: shouldOpenUpward ? 'top' : 'bottom',
        listMaxHeight: nextListMaxHeight,
        portalTop: constrainedTop,
        portalLeft: rect.left,
        portalWidth: rect.width,
      }
    }, [])

    // Calculate and apply dropdown layout immediately when opening
    React.useEffect(() => {
      if (!isOpen) return

      const frameId = requestAnimationFrame(() => {
        const layout = calculateDropdownLayout()
        if (!layout) return

        setMenuPlacement(layout.placement as 'top' | 'bottom')
        setListMaxHeight(layout.listMaxHeight)

        if (usePortal) {
          setPortalPosition({
            top: layout.portalTop,
            left: layout.portalLeft,
            width: layout.portalWidth,
          })
        }
      })

      return () => cancelAnimationFrame(frameId)
    }, [isOpen, calculateDropdownLayout, usePortal])

    React.useEffect(() => {
      if (!isOpen) return
      searchInputRef.current?.focus()
      setIsNavigatingKeyboard(false)
      setIsHovering(false)

      const selectedIndex = filteredOptions.findIndex(
        (option) => option.value === value && !option.disabled
      )
      if (selectedIndex >= 0) {
        setHighlightedIndex(selectedIndex)
        return
      }

      const firstEnabledIndex = filteredOptions.findIndex(
        (option) => !option.disabled
      )
      setHighlightedIndex(firstEnabledIndex >= 0 ? firstEnabledIndex : -1)
    }, [isOpen, filteredOptions, value])

    React.useEffect(() => {
      if (!isOpen || !listRef.current) return
      const element = listRef.current.querySelector<HTMLElement>(
        `[data-option-index="${highlightedIndex}"]`
      )
      element?.scrollIntoView?.({ block: 'nearest' })
    }, [highlightedIndex, isOpen])

    // Update portal position and state based on calculated layout
    const updatePortalPosition = React.useCallback(() => {
      const layout = calculateDropdownLayout()
      if (!layout) return

      setMenuPlacement(layout.placement as 'top' | 'bottom')
      setListMaxHeight(layout.listMaxHeight)
      setPortalPosition({
        top: layout.portalTop,
        left: layout.portalLeft,
        width: layout.portalWidth,
      })
    }, [calculateDropdownLayout])

    const listMaxHeightStyle = `${listMaxHeight}px`

    React.useEffect(() => {
      if (
        !isOpen ||
        !usePortal ||
        !triggerRef.current ||
        typeof ResizeObserver === 'undefined'
      )
        return

      const observer = new ResizeObserver(() => updatePortalPosition())
      observer.observe(triggerRef.current)

      return () => observer.disconnect()
    }, [isOpen, updatePortalPosition, usePortal])

    React.useEffect(() => {
      if (!isOpen || !usePortal) return

      updatePortalPosition()
      const handleScrollOrResize = () => updatePortalPosition()

      window.addEventListener('resize', handleScrollOrResize)
      document.addEventListener('scroll', handleScrollOrResize, true)
      document.addEventListener('visibilitychange', handleScrollOrResize)

      return () => {
        window.removeEventListener('resize', handleScrollOrResize)
        document.removeEventListener('scroll', handleScrollOrResize, true)
        document.removeEventListener('visibilitychange', handleScrollOrResize)
      }
    }, [isOpen, updatePortalPosition, usePortal])

    // Watch for layout changes in parent containers
    React.useEffect(() => {
      if (!isOpen || !containerRef.current) return

      const observer = new MutationObserver(() => {
        requestAnimationFrame(() => {
          updatePortalPosition()
        })
      })

      const observeTarget = containerRef.current
      observer.observe(observeTarget, {
        attributes: true,
        attributeFilter: ['style', 'class'],
        subtree: false,
      })

      let parent = observeTarget.parentElement
      let depth = 0
      while (parent && depth < 5) {
        observer.observe(parent, {
          attributes: true,
          attributeFilter: ['style', 'class'],
          childList: false,
        })
        parent = parent.parentElement
        depth += 1
      }

      return () => observer.disconnect()
    }, [isOpen, updatePortalPosition])

    const closeMenu = React.useCallback(
      (shouldRestoreFocus = false) => {
        setIsOpen(false)
        setQuery('')
        setHighlightedIndex(-1)
        setIsNavigatingKeyboard(false)
        setIsHovering(false)
        if (shouldRestoreFocus) {
          requestAnimationFrame(() => triggerRef.current?.focus())
        }
      },
      []
    )

    const selectOption = React.useCallback(
      (option: SearchableSelectOption) => {
        if (option.disabled) return
        onChange?.(option.value)
        closeMenu(true)
      },
      [closeMenu, onChange]
    )

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

    const openFromKeyboard = React.useCallback(() => {
      if (disabled) return
      setIsOpen(true)
    }, [disabled])

    const handleTriggerKeyDown = (
      event: React.KeyboardEvent<HTMLButtonElement>
    ) => {
      if (
        event.key === 'ArrowDown' ||
        event.key === 'Enter' ||
        event.key === ' '
      ) {
        event.preventDefault()
        openFromKeyboard()
      }
    }

    const handleMenuKeyDown = (
      event: React.KeyboardEvent<HTMLInputElement>
    ) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
        closeMenu(true)
        return
      }

      setIsNavigatingKeyboard(true)
      setIsHovering(false)

      if (event.key === 'ArrowDown') {
        event.preventDefault()
        const next = getNextEnabledIndex(highlightedIndex, 1)
        if (next >= 0) setHighlightedIndex(next)
        return
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault()
        const next = getNextEnabledIndex(highlightedIndex, -1)
        if (next >= 0) setHighlightedIndex(next)
        return
      }

      if (event.key === 'Enter') {
        event.preventDefault()
        const highlighted = filteredOptions[highlightedIndex]
        if (highlighted) selectOption(highlighted)
      }
    }

    const handleWheelCapture = (event: React.WheelEvent<HTMLDivElement>) => {
      const node = event.currentTarget
      const canScroll = node.scrollHeight > node.clientHeight
      if (!canScroll) {
        event.preventDefault()
        event.stopPropagation()
        return
      }

      const deltaY = event.deltaY
      const atTop = node.scrollTop <= 0
      const atBottom =
        node.scrollTop + node.clientHeight >= node.scrollHeight - 1

      if ((deltaY < 0 && atTop) || (deltaY > 0 && atBottom)) {
        event.preventDefault()
      }

      event.stopPropagation()
    }

    const renderMenu = () => (
      <div
        ref={menuRef}
        className={cn(
          'rounded-md border border-(--c-border) bg-(--c-panel) p-2 shadow-md',
          !usePortal &&
            (menuPlacement === 'top'
              ? 'absolute bottom-full mb-1 w-full z-100'
              : 'absolute top-full mt-1 w-full z-100')
        )}
        style={
          usePortal
            ? {
                position: 'fixed',
                top: portalPosition.top,
                left: portalPosition.left,
                width: portalPosition.width,
                maxHeight: `${listMaxHeight + 64}px`,
                zIndex: menuZIndex,
                overflow: 'hidden',
              }
            : undefined
        }
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-(--c-text-muted) pointer-events-none" />
          <Input
            ref={searchInputRef}
            type="text"
            size="sm"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleMenuKeyDown}
            placeholder={searchPlaceholder}
            className="pl-9 pr-9"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('')
                searchInputRef.current?.focus()
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-(--c-text-muted) hover:text-(--c-text) hover:bg-(--c-surface-hover) transition-colors duration-150"
              aria-label="Clear search"
              tabIndex={-1}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div
          ref={listRef}
          className="overflow-y-auto overscroll-contain"
          style={{ maxHeight: listMaxHeightStyle }}
          onWheelCapture={handleWheelCapture}
        >
          {filteredOptions.length === 0 ? (
            <div className="px-3 py-6 text-center text-sm text-(--c-text-muted)">
              {emptyText}
            </div>
          ) : (
            <ul role="listbox">
              {filteredOptions.map((option, index) => {
                const isSelected = option.value === value
                const isHighlighted =
                  index === highlightedIndex &&
                  (isNavigatingKeyboard || isHovering)

                return (
                  <li
                    key={option.value}
                    role="option"
                    aria-selected={isSelected}
                    data-option-index={index}
                    className={cn(
                      'flex cursor-pointer items-center justify-between px-3 py-2 text-sm transition-colors rounded-sm',
                      option.disabled
                        ? 'cursor-not-allowed text-(--c-text-muted) opacity-60'
                        : 'text-(--c-text)',
                      // Highlight (hover/keyboard) and selected each own the background so
                      // they never collide; selected keeps its accent text even when the
                      // transient highlight is painting a different background on top.
                      isHighlighted &&
                        !option.disabled &&
                        'bg-(--c-surface-hover)',
                      isSelected &&
                        !option.disabled &&
                        'text-(--c-accent) font-medium',
                      isSelected &&
                        !isHighlighted &&
                        !option.disabled &&
                        'bg-(--c-accent)/10'
                    )}
                    onMouseEnter={() => {
                      setHighlightedIndex(index)
                      setIsHovering(true)
                      setIsNavigatingKeyboard(false)
                    }}
                    onMouseLeave={() => {
                      setIsHovering(false)
                    }}
                    onClick={() => selectOption(option)}
                  >
                    <span className="truncate">{option.label}</span>
                    {isSelected && (
                      <Check className="ml-2 h-4 w-4 shrink-0 text-(--c-accent)" />
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    )

    return (
      <div
        className={cn('relative', className)}
        ref={(node) => {
          containerRef.current = node
          if (typeof ref === 'function') ref(node)
          else if (ref) ref.current = node
        }}
      >
        <button
          type="button"
          id={id}
          disabled={disabled}
          onClick={() => !disabled && setIsOpen((prev) => !prev)}
          onKeyDown={handleTriggerKeyDown}
          ref={triggerRef}
          className={cn(
            'flex w-full items-center justify-between rounded-(--c-radius) border border-(--c-input-border) bg-(--c-input-bg) text-(--c-text) transition-colors',
            CONTROL_SIZE_CLASSES[size],
            'focus-visible:outline-none focus-visible:border-(--c-accent)',
            isOpen &&
              'border-(--c-accent)/30 bg-(--c-accent)/5 shadow-sm ring-1 ring-(--c-accent)/10',
            'disabled:cursor-not-allowed disabled:opacity-50'
          )}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span
            className={cn(
              'truncate',
              !selectedOption && 'text-(--c-text-muted)'
            )}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <span className="ml-2 flex items-center gap-1">
            {/* No clear affordance for an empty-string value: clearing resolves to
                onChange('') — a no-op when '' is already selected (e.g. a "None"
                option using '' as its value). */}
            {selectedOption && !!value && !disabled && (
              <span
                role="button"
                aria-label={clearAriaLabel}
                tabIndex={0}
                className="rounded p-0.5 text-(--c-text-muted) hover:text-(--c-text) hover:bg-(--c-surface-hover)"
                onClick={(event) => {
                  event.stopPropagation()
                  onChange?.('')
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    event.stopPropagation()
                    onChange?.('')
                  }
                }}
              >
                <X className="h-3.5 w-3.5" />
              </span>
            )}
            <ChevronDown
              className={cn(
                'h-4 w-4 opacity-50 transition-transform',
                isOpen && 'rotate-180'
              )}
            />
          </span>
        </button>

        {isOpen &&
          (usePortal && typeof document !== 'undefined'
            ? createPortal(
                renderMenu(),
                portalTarget ?? detectedPortalTarget ?? document.body
              )
            : renderMenu())}
      </div>
    )
  }
)
SearchableSelect.displayName = 'SearchableSelect'
