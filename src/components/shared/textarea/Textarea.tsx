import * as React from "react";
import {clsx} from 'clsx';

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    label?: string;
    hint?: string;
    error?: string;
};

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({className, label, hint, error, id, ...props}, ref) => {
        const textareaId = id ?? React.useId();
        return (
            <div className="space-y-1.5">
                {label && (
                    <label htmlFor={textareaId} className="text-sm font-medium text-slate-700">
                        {label}
                    </label>
                )}
                <textarea
                    ref={ref}
                    id={textareaId}
                    className={clsx(
                        "min-h-24 w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none transition",
                        "border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10",
                        error && "border-red-300 focus:border-red-400 focus:ring-red-500/10",
                        className
                    )}
                    {...props}
                />
                {error ? (
                    <p className="text-xs text-red-600">{error}</p>
                ) : hint ? (
                    <p className="text-xs text-slate-500">{hint}</p>
                ) : null}
            </div>
        );
    }
);
Textarea.displayName = "Textarea";