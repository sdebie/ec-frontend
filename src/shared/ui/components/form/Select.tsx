import {ChevronDown} from 'lucide-react'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import {Label} from './Label'
import {cn} from '@/shared/utils/cn'
import {CONTROL_SIZE_CLASSES, type ControlSize} from '@/shared/ui/primitives/controlSize'

export interface SelectOption {
    value: string
    label: string
    disabled?: boolean
}

export interface SelectProps {
    options: SelectOption[]
    value?: string
    onChange?: (value: string) => void
    label?: string
    placeholder?: string
    helperText?: React.ReactNode
    error?: React.ReactNode
    disabled?: boolean
    required?: boolean
    className?: string
    fullWidth?: boolean
    /** Matches Input's size scale so a Select can sit flush with a same-size Input. */
    size?: ControlSize
    /** Accessible name for the trigger button when no visible `label` is rendered
     *  (e.g. toolbar/inline usage where a stacked Label breaks the layout). */
    ariaLabel?: string
    /** Applied to the visible trigger button itself, not the outer wrapper `className` targets. */
    triggerClassName?: string
}

export const Select = React.forwardRef<HTMLDivElement, SelectProps>(
    (
        {
            options,
            value,
            onChange,
            label,
            placeholder = 'Select an option',
            helperText,
            error,
            disabled,
            required,
            className,
            fullWidth = true,
            size = 'md',
            ariaLabel,
            triggerClassName,
            ...props
        },
        ref
    ) => {
        const [isOpen, setIsOpen] = React.useState(false)
        const [dropdownStyle, setDropdownStyle] = React.useState<React.CSSProperties>({})
        const [dropdownTheme, setDropdownTheme] = React.useState<{ surface?: string; theme?: string }>({})
        const containerRef = React.useRef<HTMLDivElement>(null)
        const buttonRef = React.useRef<HTMLButtonElement>(null)
        const dropdownRef = React.useRef<HTMLDivElement>(null)
        const generatedId = React.useId()
        const hasError = !!error

        const selectedOption = React.useMemo(
            () => options.find((opt) => opt.value === value),
            [options, value]
        )

        // Calculate dropdown position and copy data-surface/data-theme from the nearest themed ancestor
        // so the portal div sits in document.body but still receives the correct CSS variable cascade.
        React.useEffect(() => {
            if (isOpen && buttonRef.current) {
                const rect = buttonRef.current.getBoundingClientRect()
                const themed = buttonRef.current.closest<HTMLElement>('[data-surface]')
                setDropdownStyle({
                    position: 'fixed',
                    top: rect.bottom + 4,
                    left: rect.left,
                    width: rect.width,
                    zIndex: 9999
                })
                setDropdownTheme({
                    surface: themed?.getAttribute('data-surface') ?? undefined,
                    theme: themed?.getAttribute('data-theme') ?? undefined,
                })
            }
        }, [isOpen])

        // Click outside to close
        React.useEffect(() => {
            const handleOutsideClick = (event: MouseEvent) => {
                const target = event.target as Node
                if (
                    containerRef.current?.contains(target) ||
                    dropdownRef.current?.contains(target)
                ) return
                setIsOpen(false)
            }

            if (isOpen) {
                document.addEventListener('mousedown', handleOutsideClick)
            }
            return () => document.removeEventListener('mousedown', handleOutsideClick)
        }, [isOpen])

        // Keyboard support for escape
        React.useEffect(() => {
            const handleKeyDown = (event: KeyboardEvent) => {
                if (event.key === 'Escape' && isOpen) {
                    setIsOpen(false)
                }
            }
            if (isOpen) {
                document.addEventListener('keydown', handleKeyDown)
            }
            return () => document.removeEventListener('keydown', handleKeyDown)
        }, [isOpen])

        const handleSelect = (option: SelectOption) => {
            if (option.disabled) return
            onChange?.(option.value)
            setIsOpen(false)
        }

        return (
            <>
                {label && (
                    <Label htmlFor={generatedId} required={required}>
                        {label}
                    </Label>
                )}
                <div
                    className={cn('relative', fullWidth && 'w-full', className)}
                    ref={(node) => {
                        containerRef.current = node
                        if (typeof ref === 'function') ref(node)
                        else if (ref) ref.current = node
                    }}
                    {...props}
                >
                    <button
                        ref={buttonRef}
                        id={generatedId}
                        type="button"
                        disabled={disabled}
                        onClick={() => !disabled && setIsOpen((prev) => !prev)}
                        className={cn(
                            'flex w-full items-center justify-between rounded-(--c-radius) border border-(--c-border) bg-(--c-input-bg) text-(--c-text) transition-colors',
                            CONTROL_SIZE_CLASSES[size],
                            'focus-visible:outline-none',
                            'disabled:cursor-not-allowed disabled:opacity-50',
                            hasError ? 'border-(--c-error)' : 'focus-visible:border-(--c-accent)',
                            !selectedOption && 'text-(--c-text-muted)',
                            triggerClassName
                        )}
                        aria-haspopup="listbox"
                        aria-expanded={isOpen}
                        aria-label={ariaLabel}
                    >
            <span className="truncate">
              {selectedOption ? selectedOption.label : placeholder}
            </span>
                        <ChevronDown
                            className={cn(
                                'h-4 w-4 opacity-50 transition-transform',
                                isOpen && 'rotate-180'
                            )}
                        />
                    </button>

                    {isOpen && ReactDOM.createPortal(
                        <div
                            ref={dropdownRef}
                            style={dropdownStyle}
                            data-surface={dropdownTheme.surface}
                            data-theme={dropdownTheme.theme}
                            // No vertical padding: it read as a gap above the first option
                            // rather than as breathing room, and the options already carry
                            // their own py-2. `overflow-auto` both scrolls past max-h-60
                            // and clips the first and last rows to the rounded corners.
                            className="max-h-60 overflow-auto rounded-md border border-(--c-border) bg-(--c-panel) shadow-lg text-sm"
                        >
                            <ul role="listbox" className="outline-none">
                                {options.map((option) => (
                                    <li
                                        key={option.value}
                                        role="option"
                                        aria-selected={value === option.value}
                                        onClick={() => handleSelect(option)}
                                        className={cn(
                                            'relative flex w-full cursor-pointer select-none items-center py-2 px-3 outline-none',
                                            option.disabled
                                                ? 'opacity-50 cursor-not-allowed text-(--c-text-muted)'
                                                : 'text-(--c-text) hover:bg-(--c-surface-hover) focus:bg-(--c-surface-hover)',
                                            value === option.value &&
                                            'bg-(--c-accent)/10 text-(--c-accent) font-medium'
                                        )}
                                    >
                                        <span className="truncate block">{option.label}</span>
                                    </li>
                                ))}
                                {options.length === 0 && (
                                    <li className="py-2 px-3 text-(--c-text-muted) text-center cursor-default">
                                        No options available
                                    </li>
                                )}
                            </ul>
                        </div>,
                        document.body
                    )}
                </div>
                {helperText && !error && (
                    <p className="mt-1 text-sm text-(--c-text-muted)">{helperText}</p>
                )}
            </>
        )
    }
)
Select.displayName = 'Select'
