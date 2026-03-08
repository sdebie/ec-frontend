import * as React from 'react';
import {cn} from '@/utils/cn.ts';
import {Label} from "@/components";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    helperText?: React.ReactNode;
    error?: React.ReactNode;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
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
                <div className="relative group flex items-center">
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
                            'flex h-10 w-full rounded-md border border-admin-border bg-admin-panel px-3 py-2 text-sm text-admin-text transition-colors',
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
            </>
        );
    }
);
Input.displayName = 'Input';
