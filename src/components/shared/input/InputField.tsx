import * as React from 'react';

import {Label} from "@/components";
import {cn} from '@/utils/cn.ts';

/**
 * InputField — composite that wraps the primitive input element with
 * a Label, optional left/right icons, helper text, and error message.
 * Use this when you need a fully-formed admin form field.
 *
 * For raw styled <input>, use Input from @/primitives/input.
 * For form-row layout with FormItem-managed label/helper/error,
 * use the primitive Input inside <FormItem>.
 */
export interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    helperText?: React.ReactNode;
    error?: React.ReactNode;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    fullWidth?: boolean;
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
            fullWidth: _fullWidth = true,
            disabled,
            ...props
        },
        ref
    ) => {
        // Generate a unique ID if one wasn't provided, to link label and input
        const generatedId = React.useId();
        const inputId = id || generatedId;
        const hasError = !!error;

        return (
            <>
                {label && (
                    <Label htmlFor={inputId} required={required}>
                        {label}
                    </Label>
                )}
                <div className="relative mt-1 group flex items-center">
                    {leftIcon && (
                        <div className="absolute left-3 text-admin-text-muted flex items-center pointer-events-none">
                            {leftIcon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        id={inputId}
                        required={required}
                        disabled={disabled}
                        className={cn(
                            'flex h-10 w-full rounded-md border-2 border-admin-border bg-admin-panel px-3 py-2 text-sm text-admin-text transition-colors',
                            'placeholder:text-admin-text-muted',
                            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent focus:ring-offset-1 focus:ring-offset-admin-bg',
                            'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-admin-bg',
                            hasError && 'border-red-500 focus:ring-red-500',
                            leftIcon && 'pl-10',
                            rightIcon && 'pr-10',
                            className
                        )}
                        {...props}
                    />
                    {rightIcon && (
                        <div className="absolute right-3 text-admin-text-muted flex items-center pointer-events-none">
                            {rightIcon}
                        </div>
                    )}
                </div>
                {error ? (
                    <p className="text-sm text-red-500 mt-1" role="alert">{error}</p>
                ) : helperText ? (
                    <p className="text-sm text-admin-text-muted mt-1">{helperText}</p>
                ) : null}
            </>
        );
    }
);
InputField.displayName = 'InputField';
