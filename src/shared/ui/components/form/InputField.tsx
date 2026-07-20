import * as React from 'react'
import { Input, type InputProps } from '@/shared/ui/primitives'
import { Label } from './Label'
import { cn } from '@/shared/utils/cn'

/**
 * InputField — composite that wraps the Input primitive with a Label,
 * optional left/right icons, helper text, and error message.
 * Uses --c-* surface tokens, so it works in any SurfaceProvider context.
 *
 * For a raw styled <input>, use Input from @/shared/ui/primitives directly.
 */
export interface InputFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  helperText?: React.ReactNode
  error?: React.ReactNode
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
  variant?: InputProps['variant']
  size?: InputProps['size']
}

export const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  (
    {
      className,
      label,
      helperText,
      error,
      id,
      required,
      leftIcon,
      rightIcon,
      fullWidth = true,
      disabled,
      variant,
      size,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId()
    const inputId = id || generatedId
    const hasError = !!error

    return (
      <>
        {label && (
          <Label htmlFor={inputId} required={required}>
            {label}
          </Label>
        )}
        <div className={cn('relative mt-1 group flex items-center', fullWidth && 'w-full')}>
          {leftIcon && (
            <div className="absolute left-3 text-(--c-text-muted) flex items-center pointer-events-none">
              {leftIcon}
            </div>
          )}
          <Input
            ref={ref}
            id={inputId}
            required={required}
            disabled={disabled}
            variant={hasError ? 'error' : (variant ?? 'default')}
            size={size}
            className={cn(leftIcon && 'pl-10', rightIcon && 'pr-10', className)}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 text-(--c-text-muted) flex items-center pointer-events-none">
              {rightIcon}
            </div>
          )}
        </div>
        {error ? (
          <p className="text-sm text-(--c-error) mt-1" role="alert">
            {error}
          </p>
        ) : helperText ? (
          <p className="text-sm text-(--c-text-muted) mt-1">{helperText}</p>
        ) : null}
      </>
    )
  }
)
InputField.displayName = 'InputField'
