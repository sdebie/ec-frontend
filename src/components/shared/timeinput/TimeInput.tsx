import * as React from 'react';
import { cn } from '@/utils/cn.ts';
import { Clock } from 'lucide-react';

export interface TimeInputProps {
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

export const TimeInput = React.forwardRef<HTMLInputElement, TimeInputProps>(
  ({ value, onChange, disabled, className, placeholder = 'Select time', ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.value);
    };

    return (
      <div className="relative">
        <input
          ref={ref}
          type="time"
          value={value || ''}
          onChange={handleChange}
          disabled={disabled}
          placeholder={placeholder}
          className={cn(
            'flex h-10 w-full rounded-md border-2 border-admin-border bg-admin-panel px-3 py-2 text-sm text-admin-text transition-colors pr-10',
            'placeholder:text-admin-text-muted',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent focus:ring-offset-1 focus:ring-offset-admin-bg',
            'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-admin-bg',
            '[&::-webkit-calendar-picker-indicator]:opacity-0',
            className
          )}
          {...props}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-admin-text-muted pointer-events-none">
          <Clock className="w-4 h-4" />
        </div>
      </div>
    );
  }
);
TimeInput.displayName = 'TimeInput';

