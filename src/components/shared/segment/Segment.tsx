import * as React from 'react';

import { cn } from '@/utils/cn.ts';

export interface SegmentOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SegmentProps {
  options: SegmentOption[];
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
  fullWidth?: boolean;
}

export const Segment = React.forwardRef<HTMLDivElement, SegmentProps>(
  ({ options, value, onChange, disabled, className, fullWidth = false, ...props }, ref) => {
    const handleSelect = (optionValue: string, optionDisabled?: boolean) => {
      if (!disabled && !optionDisabled) {
        onChange?.(optionValue);
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex rounded-lg bg-admin-bg p-1 gap-1',
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
                  ? 'bg-admin-panel text-admin-text shadow-sm'
                  : 'text-admin-text-muted hover:text-admin-text',
                isDisabled && 'opacity-50 cursor-not-allowed',
                'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:ring-offset-admin-bg'
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

