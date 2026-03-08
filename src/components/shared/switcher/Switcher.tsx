import * as React from 'react';
import { cn } from '@/utils/cn.ts';

export interface SwitcherProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
}

export const Switcher = React.forwardRef<HTMLInputElement, SwitcherProps>(
  ({ checked, onChange, disabled, label, className, ...props }, ref) => {
    const generatedId = React.useId();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.checked);
    };

    return (
      <div className={cn('flex items-center gap-3', className)}>
        <div className="relative inline-flex items-center">
          <input
            ref={ref}
            id={generatedId}
            type="checkbox"
            checked={checked}
            onChange={handleChange}
            disabled={disabled}
            className="sr-only peer"
            {...props}
          />
          <div
            className={cn(
              'w-11 h-6 rounded-full transition-colors cursor-pointer',
              'bg-admin-border peer-checked:bg-primary',
              'peer-focus:ring-2 peer-focus:ring-primary peer-focus:ring-offset-1 peer-focus:ring-offset-admin-bg',
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
        {label && (
          <label
            htmlFor={generatedId}
            className={cn(
              'text-sm text-admin-text cursor-pointer select-none',
              disabled && 'cursor-not-allowed opacity-50'
            )}
          >
            {label}
          </label>
        )}
      </div>
    );
  }
);
Switcher.displayName = 'Switcher';

