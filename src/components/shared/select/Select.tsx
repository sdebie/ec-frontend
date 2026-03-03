import * as React from "react";
import {clsx} from 'clsx';

export type SelectOption = { label: string; value: string };

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
    label?: string;
    hint?: string;
    error?: string;
    options: SelectOption[];
    placeholder?: string;
};

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({className, label, hint, error, options, placeholder, id, ...props}, ref) => {
        const selectId = id ?? React.useId();
        return (
            <div className="space-y-1.5">
                {label && (
                    <label htmlFor={selectId} className="text-sm font-medium text-slate-700">
                        {label}
                    </label>
                )}
                <select
                    ref={ref}
                    id={selectId}
                    className={clsx(
                        "h-10 w-full rounded-lg border bg-white px-3 text-sm outline-none transition",
                        "border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10",
                        error && "border-red-300 focus:border-red-400 focus:ring-red-500/10",
                        className
                    )}
                    {...props}
                >
                    {placeholder && <option value="">{placeholder}</option>}
                    {options.map((o) => (
                        <option key={o.value} value={o.value}>
                            {o.label}
                        </option>
                    ))}
                </select>
                {error ? (
                    <p className="text-xs text-red-600">{error}</p>
                ) : hint ? (
                    <p className="text-xs text-slate-500">{hint}</p>
                ) : null}
            </div>
        );
    }
);
Select.displayName = "Select";