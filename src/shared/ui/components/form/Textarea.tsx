import * as React from 'react'
import { Label } from './Label'
import { cn } from '@/shared/utils/cn'

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string
  helperText?: React.ReactNode
  error?: React.ReactNode
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, helperText, error, id, required, ...props }, ref) => {
    const generatedId = React.useId()
    const textareaId = id ?? generatedId
    const hasError = !!error

    return (
      <div className="space-y-1.5">
        {label && (
          <Label htmlFor={textareaId} required={required}>
            {label}
          </Label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          required={required}
          className={cn(
            'min-h-24 w-full rounded-md border-2 border-(--c-border) bg-(--c-panel) px-3 py-2 text-sm text-(--c-text) transition-colors',
            'placeholder:text-(--c-text-muted)',
            'focus:outline-none focus:ring-2 focus:ring-(--c-ring) focus:border-transparent focus:ring-offset-1 focus:ring-offset-(--c-bg)',
            'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-(--c-bg)',
            hasError && 'border-(--c-error) focus:ring-(--c-error)',
            className
          )}
          {...props}
        />
        {hasError && error ? (
          <p className="text-sm text-(--c-error)">{error}</p>
        ) : helperText ? (
          <p className="text-sm text-(--c-text-muted)">{helperText}</p>
        ) : null}
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'
