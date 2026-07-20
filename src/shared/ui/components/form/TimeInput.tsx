import { Clock } from 'lucide-react'
import * as React from 'react'
import { Input } from '@/shared/ui/primitives'
import { cn } from '@/shared/utils/cn'

export interface TimeInputProps {
  value?: string
  onChange?: (value: string) => void
  disabled?: boolean
  className?: string
  placeholder?: string
}

export const TimeInput = React.forwardRef<HTMLInputElement, TimeInputProps>(
  ({ value, onChange, disabled, className, placeholder = 'Select time', ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.value)
    }

    return (
      <div className="relative">
        <Input
          ref={ref}
          type="time"
          value={value || ''}
          onChange={handleChange}
          disabled={disabled}
          placeholder={placeholder}
          className={cn(
            'pr-10 [&::-webkit-calendar-picker-indicator]:opacity-0',
            className
          )}
          {...props}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-(--c-text-muted) pointer-events-none">
          <Clock className="w-4 h-4" />
        </div>
      </div>
    )
  }
)
TimeInput.displayName = 'TimeInput'
