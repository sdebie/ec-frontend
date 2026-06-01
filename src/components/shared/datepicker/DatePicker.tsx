import { Calendar } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/utils/cn.ts';

export interface DatePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

export const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
  ({ value, onChange, disabled, className, placeholder = 'Select date', ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.value);
    };

    return (
      <div className="relative">
        <input
          ref={ref}
          type="date"
          value={value || ''}
          onChange={handleChange}
          disabled={disabled}
          placeholder={placeholder}
          className={cn(
            'flex h-10 w-full rounded-md border-2 border-(--c-border) bg-(--c-panel) px-3 py-2 text-sm text-(--c-text) transition-colors pr-10',
            'placeholder:text-(--c-text-muted)',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent focus:ring-offset-1 focus:ring-offset-(--c-bg)',
            'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-(--c-bg)',
            '[&::-webkit-calendar-picker-indicator]:opacity-0',
            className
          )}
          {...props}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-(--c-text-muted) pointer-events-none">
          <Calendar className="w-4 h-4" />
        </div>
      </div>
    );
  }
);
DatePicker.displayName = 'DatePicker';

