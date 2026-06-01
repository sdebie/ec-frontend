import {ChevronDown} from 'lucide-react';
import * as React from 'react';
import {Label} from "@/components";
import {cn} from '@/utils/cn.ts';

export interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
}

export interface SelectProps {
    options: SelectOption[];
    value?: string;
    onChange?: (value: string) => void;
    label?: string;
    placeholder?: string;
    helperText?: React.ReactNode;
    error?: React.ReactNode;
    disabled?: boolean;
    required?: boolean;
    className?: string;
    fullWidth?: boolean;
}

export const Select = React.forwardRef<HTMLDivElement, SelectProps>(
    (
        {
            options,
            value,
            onChange,
            label,
            placeholder = 'Select an option',
            helperText: _helperText,
            error,
            disabled,
            required,
            className,
            fullWidth: _fullWidth = true,
            ...props
        },
        ref
    ) => {
        const [isOpen, setIsOpen] = React.useState(false);
        const containerRef = React.useRef<HTMLDivElement>(null);
        const generatedId = React.useId();
        const hasError = !!error;

        const selectedOption = React.useMemo(
            () => options.find((opt) => opt.value === value),
            [options, value]
        );

        // Click outside to close
        React.useEffect(() => {
            const handleOutsideClick = (event: MouseEvent) => {
                if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                    setIsOpen(false);
                }
            };

            if (isOpen) {
                document.addEventListener('mousedown', handleOutsideClick);
            }
            return () => document.removeEventListener('mousedown', handleOutsideClick);
        }, [isOpen]);

        // Keyboard support for escape
        React.useEffect(() => {
            const handleKeyDown = (event: KeyboardEvent) => {
                if (event.key === 'Escape' && isOpen) {
                    setIsOpen(false);
                }
            };
            if (isOpen) {
                document.addEventListener('keydown', handleKeyDown);
            }
            return () => document.removeEventListener('keydown', handleKeyDown);
        }, [isOpen]);

        const handleSelect = (option: SelectOption) => {
            if (option.disabled) return;
            onChange?.(option.value);
            setIsOpen(false);
        };

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
                        containerRef.current = node;
                        if (typeof ref === 'function') ref(node);
                        else if (ref) ref.current = node;
                    }}
                    {...props}
                >
                    <button
                        id={generatedId}
                        type="button"
                        disabled={disabled}
                        onClick={() => !disabled && setIsOpen((prev) => !prev)}
                        className={cn(
                            'flex h-10 w-full items-center justify-between rounded-md border-2 border-(--c-border) bg-(--c-panel) px-3 py-2 text-sm text-(--c-text) transition-colors',
                            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent focus:ring-offset-1 focus:ring-offset-(--c-bg)',
                            'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-(--c-bg)',
                            hasError && 'border-red-500 focus:ring-red-500',
                            !selectedOption && 'text-(--c-text-muted)'
                        )}
                        aria-haspopup="listbox"
                        aria-expanded={isOpen}
                    >
            <span className="truncate">
              {selectedOption ? selectedOption.label : placeholder}
            </span>
                        <ChevronDown className={cn("h-4 w-4 opacity-50 transition-transform", isOpen && "rotate-180")}/>
                    </button>

                    {isOpen && (
                        <div
                            className="absolute z-100 mt-1 max-h-60 w-full overflow-auto rounded-md border border-(--c-border) bg-(--c-panel) py-1 shadow-md text-sm">
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
                                            value === option.value && 'bg-primary-subtle text-primary font-medium'
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
                        </div>
                    )}
                </div>
            </>
        );
    }
);
Select.displayName = 'Select';