import * as React from "react";
import {cn} from '@/utils/cn.ts';
import {Label} from "@/components";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    label?: string;
    helperText?: React.ReactNode;
    error?: React.ReactNode;
};

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({className, label, helperText, error, id, required, ...props}, ref) => {
        const textareaId = id ?? React.useId();
        const hasError = !!error;
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
                        "min-h-24 w-full rounded-md border-2 border-admin-border bg-admin-panel px-3 py-2 text-sm text-admin-text transition-colors",
                        "placeholder:text-admin-text-muted",
                        "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent focus:ring-offset-1 focus:ring-offset-admin-bg",
                        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-admin-bg",
                        hasError && 'border-red-500 focus:ring-red-500',
                        className
                    )}
                    {...props}
                />
                {hasError && error ? (
                    <p className="text-sm text-red-500">{error}</p>
                ) : helperText ? (
                    <p className="text-sm text-admin-text-muted">{helperText}</p>
                ) : null}
            </div>
        );
    }
);
Textarea.displayName = "Textarea";