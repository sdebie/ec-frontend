import * as React from 'react'
import { Label } from './Label'
import { cn } from '@/shared/utils/cn'

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  /** Accepts nodes so callers can style suffixes like a muted "(optional)". */
  label?: React.ReactNode
  helperText?: React.ReactNode
  error?: React.ReactNode
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, helperText, error, id, required, ...props }, ref) => {
    const generatedId = React.useId()
    const textareaId = id ?? generatedId
    const hasError = !!error

    // Wire the message to the control for assistive tech, and announce it —
    // matching InputField. Without this, a screen-reader user tabbing back to
    // the textarea hears no error. Callers may still override via props.
    const messageId = hasError
      ? `${textareaId}-error`
      : helperText
        ? `${textareaId}-helper`
        : undefined

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
          aria-invalid={hasError || undefined}
          aria-describedby={messageId}
          className={cn(
            'min-h-24 w-full rounded-(--c-radius) border border-(--c-input-border) bg-(--c-input-bg) px-4 py-2 text-sm text-(--c-text) transition-colors',
            'placeholder:text-(--c-text-muted)',
            'focus-visible:outline-none',
            'disabled:cursor-not-allowed disabled:opacity-50',
            hasError
              ? 'border-(--c-error)'
              : 'hover:border-(--c-input-hover-border) focus-visible:border-(--c-accent)',
            className
          )}
          {...props}
        />
        {hasError && error ? (
          <p id={messageId} className="text-sm text-(--c-error)" role="alert">
            {error}
          </p>
        ) : helperText ? (
          <p id={messageId} className="text-sm text-(--c-text-muted)">
            {helperText}
          </p>
        ) : null}
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'
