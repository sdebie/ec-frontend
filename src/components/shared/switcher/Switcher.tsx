import {InputHTMLAttributes, Ref, useId} from 'react';

import {cn} from '@/utils/cn.ts';

export interface SwitcherProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
    checked?: boolean;
    onChange?: (checked: boolean) => void;
    disabled?: boolean;
    label?: string;
    labelPosition?: 'left' | 'right';
    className?: string;
    ref?: Ref<HTMLInputElement>;
}

export const Switcher = ({
                             checked,
                             onChange,
                             disabled,
                             label,
                             labelPosition = 'right',
                             className,
                             ref,
                             ...props
                         }: SwitcherProps) => {

    const generatedId = useId();

    const handleChange = (value: boolean) => {
        if (disabled) return;
        onChange?.(value);
    };

    const switchToggle = (
        <div className="relative inline-flex items-center">
            <input
                ref={ref}
                id={generatedId}
                type="checkbox"
                checked={checked}
                onChange={(e) => handleChange(e.target.checked)}
                disabled={disabled}
                className="sr-only peer"
                {...props}
            />
            <div
                role={"switch"}
                aria-checked={checked}
                tabIndex={disabled ? -1 : 0}
                onClick={() => handleChange(!checked)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleChange(!checked);
                    }
                }}
                className={cn(
                    'w-11 h-6 rounded-full transition-colors cursor-pointer',
                    'bg-(--c-border) peer-checked:bg-primary',
                    'peer-focus:ring-2 peer-focus:ring-primary peer-focus:ring-offset-1 peer-focus:ring-offset-(--c-bg)',
                    'peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
                    'relative'
                )}
            >
                <div
                    className={cn(
                        'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform',
                        checked && 'translate-x-5'
                    )}
                />
            </div>
        </div>
    );

    const labelElement = label && (
        <label
            className={cn(
                'text-sm text-(--c-text) cursor-pointer select-none',
                disabled && 'cursor-not-allowed opacity-50'
            )}
        >
            {label}
        </label>
    );

    return (
        <div className={cn('flex items-center gap-3', className)}>
            {labelPosition === 'left' && labelElement}
            {switchToggle}
            {labelPosition === 'right' && labelElement}
        </div>
    );
};

