import {Check, ChevronDown, X} from 'lucide-react';
import * as React from 'react';
import {Label} from '@/components';
import {cn} from '@/utils/cn.ts';

export interface MultiSelectOption {
    value: string;
    label: string;
    disabled?: boolean;
}

export interface MultiSelectProps {
    options: MultiSelectOption[];
    value?: string[];
    onChange?: (value: string[]) => void;
    label?: string;
    placeholder?: string;
    helperText?: React.ReactNode;
    error?: React.ReactNode;
    disabled?: boolean;
    required?: boolean;
    className?: string;
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
        const [isOpen, setIsOpen] = React.useState(false);
        const containerRef = React.useRef<HTMLDivElement>(null);
        const generatedId = React.useId();
        const hasError = !!error;

        const selectedOptions = React.useMemo(
            () => options.filter((opt) => value.includes(opt.value)),
            [options, value]
        );

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

        const handleToggle = (optionValue: string, optionDisabled?: boolean) => {
            if (optionDisabled || disabled) return;

            const newValue = value.includes(optionValue)
                ? value.filter((v) => v !== optionValue)
                : [...value, optionValue];

            onChange?.(newValue);
        };

        const handleRemove = (optionValue: string, e: React.MouseEvent) => {
            e.stopPropagation();
            if (!disabled) {
                onChange?.(value.filter((v) => v !== optionValue));
            }
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
                            'flex min-h-10 w-full items-center justify-between rounded-md border-2 border-(--c-border) bg-(--c-panel) px-3 py-2 text-sm text-(--c-text) transition-colors',
                            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent focus:ring-offset-1 focus:ring-offset-(--c-bg)',
                            'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-(--c-bg)',
                            hasError && 'border-red-500 focus:ring-red-500'
                        )}
                        aria-haspopup="listbox"
                        aria-expanded={isOpen}
                    >
                        <div className="flex flex-wrap gap-1 flex-1 min-w-0">
                            {selectedOptions.length > 0 ? (
                                selectedOptions.map((option) => (
                                    <span
                                        key={option.value}
                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-primary-subtle text-primary text-xs font-medium"
                                    >
                    {option.label}
                                        {!disabled && (
                                            <button
                                                type="button"
                                                onClick={(e) => handleRemove(option.value, e)}
                                                className="hover:text-primary-dark"
                                            >
                                                <X className="w-3 h-3"/>
                                            </button>
                                        )}
                  </span>
                                ))
                            ) : (
                                <span className="text-(--c-text-muted)">{placeholder}</span>
                            )}
                        </div>
                        <ChevronDown
                            className={cn('h-4 w-4 opacity-50 transition-transform ml-2 shrink-0', isOpen && 'rotate-180')}/>
                    </button>

                    {isOpen && (
                        <div
                            className="absolute z-100 mt-1 max-h-60 w-full overflow-auto rounded-md border border-(--c-border) bg-(--c-panel) py-1 shadow-md text-sm">
                            <ul role="listbox" className="outline-none">
                                {options.map((option) => {
                                    const isSelected = value.includes(option.value);
                                    const isDisabled = option.disabled;

                                    return (
                                        <li
                                            key={option.value}
                                            role="option"
                                            aria-selected={isSelected}
                                            onClick={() => handleToggle(option.value, option.disabled)}
                                            className={cn(
                                                'relative flex w-full cursor-pointer select-none items-center justify-between py-2 px-3 outline-none',
                                                isDisabled
                                                    ? 'opacity-50 cursor-not-allowed text-(--c-text-muted)'
                                                    : 'text-(--c-text) hover:bg-(--c-surface-hover) focus:bg-(--c-surface-hover)',
                                                isSelected && 'bg-primary-subtle text-primary font-medium'
                                            )}
                                        >
                                            <span className="truncate block">{option.label}</span>
                                            {isSelected && <Check className="w-4 h-4 shrink-0 ml-2"/>}
                                        </li>
                                    );
                                })}
                                {options.length === 0 && (
                                    <li className="py-2 px-3 text-(--c-text-muted) text-center cursor-default">
                                        No options available
                                    </li>
                                )}
                            </ul>
                        </div>
                    )}
                </div>
                {hasError && error && <p className="text-sm text-red-500 mt-1">{error}</p>}
                {!hasError && helperText && <p className="text-sm text-(--c-text-muted) mt-1">{helperText}</p>}
            </>
        );
    }
);
MultiSelect.displayName = 'MultiSelect';



