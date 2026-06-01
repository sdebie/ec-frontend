import * as React from 'react';
import {cn} from '@/utils/cn.ts';

export interface SegmentOption {
    value: string;
    label: string;
    icon?: React.ReactNode;
    disabled?: boolean;
}

export interface SegmentProps {
    options: SegmentOption[];
    value?: string;
    onChange?: (value: string) => void;
    disabled?: boolean;
    className?: string;
    fullWidth?: boolean;
    variant?: 'pill' | 'tabs';
}

export const Segment = React.forwardRef<HTMLDivElement, SegmentProps>(
    ({options, value, onChange, disabled, className, fullWidth = false, variant = 'pill', ...props}, ref) => {
        const handleSelect = (optionValue: string, optionDisabled?: boolean) => {
            if (!disabled && !optionDisabled) {
                onChange?.(optionValue);
            }
        };

        if (variant === 'tabs') {
            return (
                <div
                    ref={ref}
                    className={cn('flex w-full border-b border-(--c-border) overflow-x-auto', className)}
                    {...props}
                >
                    {options.map((option) => {
                        const isSelected = value === option.value;
                        const isDisabled = disabled || option.disabled;

                        return (
                            <button
                                key={option.value}
                                type="button"
                                disabled={isDisabled}
                                onClick={() => handleSelect(option.value, option.disabled)}
                                className={cn(
                                    'flex items-center gap-2 px-5 py-4 text-sm font-medium whitespace-nowrap -mb-px border-b-2 transition-colors focus:outline-none',
                                    isSelected
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-(--c-text-muted) hover:text-(--c-text)',
                                    isDisabled && 'opacity-50 cursor-not-allowed'
                                )}
                            >
                                {option.icon && <span className="shrink-0">{option.icon}</span>}
                                {option.label}
                            </button>
                        );
                    })}
                </div>
            );
        }

        return (
            <div
                ref={ref}
                className={cn(
                    'inline-flex rounded-lg bg-(--c-bg) p-1 gap-1',
                    fullWidth && 'w-full',
                    className
                )}
                {...props}
            >
                {options.map((option) => {
                    const isSelected = value === option.value;
                    const isDisabled = disabled || option.disabled;

                    return (
                        <button
                            key={option.value}
                            type="button"
                            disabled={isDisabled}
                            onClick={() => handleSelect(option.value, option.disabled)}
                            className={cn(
                                'px-4 py-2 text-sm font-medium rounded-md transition-colors',
                                fullWidth && 'flex-1',
                                isSelected
                                    ? 'bg-(--c-panel) text-(--c-text) shadow-sm'
                                    : 'text-(--c-text-muted) hover:text-(--c-text)',
                                isDisabled && 'opacity-50 cursor-not-allowed',
                                'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:ring-offset-(--c-bg)'
                            )}
                        >
                            {option.label}
                        </button>
                    );
                })}
            </div>
        );
    }
);
Segment.displayName = 'Segment';

