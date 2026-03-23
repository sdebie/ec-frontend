import * as React from 'react';
import { cn } from '@/utils/cn.ts';
import { Check } from 'lucide-react';

export interface CheckboxProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ checked, onChange, disabled, label, className, ...props }, ref) => {
    const generatedId = React.useId();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.checked);
    };

    return (
      <div className={cn('flex items-center gap-2', className)}>
        <label htmlFor={generatedId} className="relative inline-flex items-center cursor-pointer">
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
              'w-5 h-5 rounded border-2 border-admin-border bg-admin-panel transition-colors',
              'peer-focus:ring-2 peer-focus:ring-primary peer-focus:ring-offset-1 peer-focus:ring-offset-admin-bg',
              'peer-checked:bg-primary peer-checked:border-primary',
              'peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
              'flex items-center justify-center pointer-events-none'
            )}
          >
            {checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
          </div>
        </label>
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
Checkbox.displayName = 'Checkbox';

