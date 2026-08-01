import * as React from 'react'
import {Label} from './Label'
import {cn} from '@/shared/utils/cn'

export interface FormItemProps {
    label?: string
    required?: boolean
    helperText?: React.ReactNode
    errorMessage?: React.ReactNode
    invalid?: boolean
    className?: string
    children: React.ReactNode
}

export const FormItem: React.FC<FormItemProps> = ({
                                                      label,
                                                      required,
                                                      helperText,
                                                      errorMessage,
                                                      invalid,
                                                      className,
                                                      children,
                                                  }) => {
    const generatedId = React.useId()
    const hasError = invalid || !!errorMessage

    const fieldChild = React.cloneElement(
        React.Children.only(children) as React.ReactElement<{ id?: string }>,
        {id: generatedId},
    )

    return (
        <div className={cn('space-y-1', className)}>
            {label && (
                <Label htmlFor={generatedId} required={required}>
                    {label}
                </Label>
            )}
            <div>{fieldChild}</div>
            {hasError && errorMessage && (
                <p className="text-sm text-(--c-error)">{errorMessage}</p>
            )}
            {!hasError && helperText && (
                <p className="text-sm text-(--c-text-muted)">{helperText}</p>
            )}
        </div>
    )
}

export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
    children: React.ReactNode
}

export const Form = React.forwardRef<HTMLFormElement, FormProps>(
    ({className, children, ...props}, ref) => {
        return (
            <form ref={ref} className={cn('space-y-6', className)} {...props}>
                {children}
            </form>
        )
    }
)
Form.displayName = 'Form'
