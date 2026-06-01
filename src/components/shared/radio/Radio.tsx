import * as React from 'react';

import { cn } from '@/utils/cn.ts';

export interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface RadioProps {
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
  orientation?: 'vertical' | 'horizontal';
}

export const Radio = React.forwardRef<HTMLDivElement, RadioProps>(
  ({ options, value, onChange, disabled, className, orientation = 'vertical', ...props }, ref) => {
    const name = React.useId();

    const handleChange = (optionValue: string) => {
      if (!disabled) {
        onChange?.(optionValue);
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          'flex gap-4',
          orientation === 'vertical' ? 'flex-col' : 'flex-row flex-wrap',
          className
        )}
        {...props}
      >
        {options.map((option) => {
          const isChecked = value === option.value;
          const isDisabled = disabled || option.disabled;
          const optionId = `${name}-${option.value}`;

          return (
            <div key={option.value} className="flex items-center gap-2">
              <div className="relative inline-flex items-center">
                <input
                  id={optionId}
                  type="radio"
                  name={name}
                  value={option.value}
                  checked={isChecked}
                  onChange={() => handleChange(option.value)}
                  disabled={isDisabled}
                  className="sr-only peer"
                />
                <div
                  className={cn(
                    'w-5 h-5 rounded-full border-2 border-(--c-border) bg-(--c-panel) transition-colors cursor-pointer',
                    'peer-focus:ring-2 peer-focus:ring-primary peer-focus:ring-offset-1 peer-focus:ring-offset-(--c-bg)',
                    'peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
                    'flex items-center justify-center'
                  )}
                >
                  {isChecked && (
                    <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                  )}
                </div>
              </div>
              <label
                htmlFor={optionId}
                className={cn(
                  'text-sm text-(--c-text) cursor-pointer select-none',
                  isDisabled && 'cursor-not-allowed opacity-50'
                )}
              >
                {option.label}
              </label>
            </div>
          );
        })}
      </div>
    );
  }
);
Radio.displayName = 'Radio';

