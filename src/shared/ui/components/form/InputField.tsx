import * as React from 'react'
import {Input, type InputProps} from '@/shared/ui/primitives'
import {Label} from './Label'
import {cn} from '@/shared/utils/cn'

/**
 * InputField — composite that wraps the Input primitive with a Label,
 * optional left/right icons, helper text, and error message.
 * Uses --c-* surface tokens, so it works in any SurfaceProvider context.
 *
 * For a raw styled <input>, use Input from @/shared/ui/primitives directly.
 */
export interface InputFieldProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
    /** Accepts nodes so callers can style suffixes like a muted "(optional)". */
    label?: React.ReactNode
    helperText?: React.ReactNode
    error?: React.ReactNode
    leftIcon?: React.ReactNode
    rightIcon?: React.ReactNode
    /**
     * Lets `rightIcon` receive clicks (password show/hide toggles, clear buttons).
     * Defaults to false so decorative icons stay click-through as before.
     */
    rightIconInteractive?: boolean
    /**
     * Whether `required` also renders the Label's asterisk. Defaults to true.
     * Set false when the control must carry the HTML attribute but the form
     * does not mark required fields visually — marking only some of the
     * required fields reads as a bug.
     */
    showRequiredIndicator?: boolean
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
            rightIconInteractive = false,
            showRequiredIndicator = true,
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

        // Wire the message to the control for assistive tech. `role="alert"` alone
        // announces the message but leaves it unassociated with the field, so a
        // screen-reader user tabbing back to the input hears no error. Callers may
        // still pass their own aria-describedby/aria-invalid to override.
        const messageId = hasError ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined

        return (
            <>
                {label && (
                    <Label htmlFor={inputId} required={required && showRequiredIndicator}>
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
                        aria-invalid={hasError || undefined}
                        aria-describedby={messageId}
                        className={cn(leftIcon && 'pl-10', rightIcon && 'pr-10', className)}
                        {...props}
                    />
                    {rightIcon && (
                        <div
                            className={cn(
                                'absolute right-3 text-(--c-text-muted) flex items-center',
                                !rightIconInteractive && 'pointer-events-none'
                            )}
                        >
                            {rightIcon}
                        </div>
                    )}
                </div>
                {error ? (
                    <p id={messageId} className="text-sm text-(--c-error) mt-1" role="alert">
                        {error}
                    </p>
                ) : helperText ? (
                    <p id={messageId} className="text-sm text-(--c-text-muted) mt-1">
                        {helperText}
                    </p>
                ) : null}
            </>
        )
    }
)
InputField.displayName = 'InputField'
